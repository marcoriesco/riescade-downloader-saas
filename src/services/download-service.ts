import { createHash } from "crypto";
import type { User } from "@supabase/supabase-js";
import gamesCatalog from "@/data/games-catalog.json";
import { AppApiError, isDownloadTester } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const FULL_MEDIA_ARCHIVE_NAMES = new Set(["_media.zip", "_media.7z"]);

interface ArchiveFile {
  name?: string;
  source?: string;
  size?: string;
  sha1?: string;
  md5?: string;
}

interface ArchiveMetadata {
  files?: ArchiveFile[];
}

interface RomsetCatalogAsset {
  id: string;
  title: string;
  download_name: string;
  file_size: number | null;
  romset_version: string;
}

const romsetCatalogCache = new Map<
  string,
  { expiresAt: number; assets: RomsetCatalogAsset[] }
>();

interface PlatformConfig {
  id: string;
  name: string;
  extensions: string[];
  install_mode?: "file" | "extract";
  install_extension?: string;
  romset?: {
    version: string;
    identifier: string;
    details_url: string;
    metadata_url: string;
    directory: string;
    allow_downloads: boolean;
    allow_updates: boolean;
  };
  archive?: {
    identifier: string;
    details_url: string;
    metadata_url: string;
    torrent_url: string;
  };
}

interface ArchiveAsset {
  id: string;
  platform: string;
  title: string;
  download_name: string;
  file_size: number | null;
  sha256: null;
  object_key: string;
  install_mode: "file" | "extract";
  install_name: string;
  romset_version: string | null;
  archive_identifier: string;
}

function getPlatformConfig(platform: string): PlatformConfig {
  const config = gamesCatalog.platforms.find(
    (item) => item.id.toLowerCase() === platform.toLowerCase()
  );
  if (!config) throw new AppApiError(404, "Platform not found");
  if (!config.archive?.identifier && !config.romset?.identifier) {
    throw new AppApiError(404, "Platform downloads are not configured yet");
  }
  return {
    ...config,
    install_mode: config.install_mode === "extract" ? "extract" : "file",
    install_extension:
      typeof config.install_extension === "string" &&
      /^\.[a-z0-9_-]+$/i.test(config.install_extension)
        ? config.install_extension.toLowerCase()
        : undefined,
  };
}

function archiveFileUrl(identifier: string, filename: string): string {
  const encodedPath = filename
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://archive.org/download/${encodeURIComponent(identifier)}/${encodedPath}`;
}

function assetId(platform: string, filename: string): string {
  return createHash("sha256").update(`${platform}\0${filename}`).digest("hex");
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function titleOf(filename: string): string {
  const basename = filename.split("/").pop() || filename;
  const dot = basename.lastIndexOf(".");
  return dot > 0 ? basename.slice(0, dot) : basename;
}

async function getArchiveMetadata(config: PlatformConfig): Promise<ArchiveMetadata> {
  if (!config.archive) return { files: [] };
  const metadataUrl = config.archive.metadata_url ||
    `https://archive.org/metadata/${encodeURIComponent(config.archive.identifier)}`;
  const response = await fetch(metadataUrl, {
    headers: { "User-Agent": "RIESCADE-Catalog/1.0" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Archive.org metadata request failed (${response.status})`);
  }
  return (await response.json()) as ArchiveMetadata;
}

async function listArchiveAssets(platform: string): Promise<ArchiveAsset[]> {
  const config = getPlatformConfig(platform);
  const romsetUpdate = config.romset;
  const archiveIdentifier = romsetUpdate?.identifier || config.archive?.identifier || "";
  const allowedExtensions = config.install_mode === "extract"
    ? new Set([".zip"])
    : new Set(config.extensions.map((extension) => extension.toLowerCase()));
  const metadata = await getArchiveMetadata(config);
  const installMode: ArchiveAsset["install_mode"] =
    config.install_mode === "extract" ? "extract" : "file";

  return (metadata.files || [])
    .filter(
      (file): file is ArchiveFile & { name: string } =>
        typeof file.name === "string" &&
        file.source === "original" &&
        !FULL_MEDIA_ARCHIVE_NAMES.has(
          (file.name.split("/").pop() || file.name).toLowerCase()
        ) &&
        allowedExtensions.has(extensionOf(file.name))
    )
    .map((file) => ({
      id: assetId(platform, file.name),
      platform,
      title: titleOf(file.name),
      download_name: file.name.split("/").pop() || file.name,
      file_size:
        typeof file.size === "string" && /^\d+$/.test(file.size)
          ? Number(file.size)
          : null,
      sha256: null,
      object_key: romsetUpdate
        ? `${romsetUpdate.directory}${file.name.split("/").pop() || file.name}`
        : file.name,
      install_mode: installMode,
      install_name: `${titleOf(file.name)}${config.install_extension || ""}`,
      romset_version: romsetUpdate?.version || null,
      archive_identifier: archiveIdentifier,
    }))
    .sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));
}

export function hasActiveSubscription(
  subscription: { status: string; end_date: string | null } | null,
  now = new Date()
): boolean {
  if (!subscription || !ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    return false;
  }
  return !subscription.end_date || new Date(subscription.end_date) > now;
}

export async function assertDownloadAccess(user: User): Promise<void> {
  if (isDownloadTester(user.id)) return;

  const { data, error } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("status,end_date")
    .eq("user_id", user.id)
    .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to verify subscription: ${error.message}`);
  if (!hasActiveSubscription(data)) {
    throw new AppApiError(403, "An active subscription is required");
  }
}

async function assertRateLimit(userId: string, configuredLimit?: number): Promise<void> {
  const limit = configuredLimit ?? Number(process.env.DOWNLOAD_REQUESTS_PER_MINUTE ?? "10");
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await getSupabaseAdmin()
    .from("download_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  if (error) throw new Error(`Failed to verify download limit: ${error.message}`);
  if ((count ?? 0) >= limit) {
    throw new AppApiError(429, "Too many download requests");
  }
}

export async function listSnesAssets() {
  return listPlatformAssets("snes");
}

export async function listPlatformAssets(platform: string) {
  const config = getPlatformConfig(platform);
  const assets = await listArchiveAssets(platform);
  return {
    assets: assets.map((asset) => ({
      id: asset.id,
      title: asset.title,
      download_name: asset.download_name,
      file_size: asset.file_size,
      sha256: asset.sha256,
      install_mode: asset.install_mode,
      install_name: asset.install_name,
      romset_version: asset.romset_version,
    })),
    detailsUrl: config.archive?.details_url || config.romset?.details_url || null,
    torrentUrl: config.archive?.torrent_url || null,
    romsetVersion: config.romset?.version || null,
    supportsRomsetUpdate: Boolean(config.romset?.allow_updates),
    supportsRomsetDownloads: Boolean(config.romset?.allow_downloads),
    supportsFullPlatformDownload: Boolean(config.archive?.torrent_url),
  };
}

export async function listRomsetCatalog(
  platform: string,
  search = "",
  offset = 0,
  limit = 500
) {
  const config = getPlatformConfig(platform);
  const romset = config.romset;
  if (!romset || !romset.allow_downloads) {
    throw new AppApiError(404, "Romset downloads are not configured for this platform");
  }

  const cacheKey = `${romset.identifier}\0${romset.version}`;
  let cached = romsetCatalogCache.get(cacheKey);
  if (!cached || cached.expiresAt <= Date.now()) {
    const response = await fetch(romset.metadata_url, {
      headers: { "User-Agent": "RIESCADE-Romset-Catalog/1.0" },
      next: { revalidate: 21600 },
    });
    if (!response.ok) {
      throw new Error(`Archive.org romset metadata request failed (${response.status})`);
    }
    const metadata = (await response.json()) as ArchiveMetadata;
    const assets = (metadata.files || [])
      .filter(
        (file): file is ArchiveFile & { name: string } =>
          typeof file.name === "string" &&
          file.source === "original" &&
          file.name.startsWith(romset.directory) &&
          extensionOf(file.name) === ".zip"
      )
      .map((file) => {
        const filename = file.name.split("/").pop() || file.name;
        return {
          id: assetId(platform, file.name),
          title: titleOf(filename),
          download_name: filename,
          file_size:
            typeof file.size === "string" && /^\d+$/.test(file.size)
              ? Number(file.size)
              : null,
          romset_version: romset.version,
        };
      })
      .sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));
    cached = { expiresAt: Date.now() + 6 * 60 * 60_000, assets };
    romsetCatalogCache.set(cacheKey, cached);
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = normalizedSearch
    ? cached.assets.filter(
        (asset) =>
          asset.title.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
          asset.download_name.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      )
    : cached.assets;
  const safeOffset = Math.max(0, Math.trunc(offset));
  const safeLimit = Math.min(1000, Math.max(1, Math.trunc(limit)));

  return {
    platform,
    version: romset.version,
    total: filtered.length,
    offset: safeOffset,
    limit: safeLimit,
    assets: filtered.slice(safeOffset, safeOffset + safeLimit),
  };
}

export async function authorizeSnesDownload(
  user: User,
  requestedAssetId: string,
  clientVersion?: string
) {
  return authorizePlatformDownload(
    user,
    "snes",
    requestedAssetId,
    clientVersion
  );
}

export async function authorizePlatformDownload(
  user: User,
  platform: unknown,
  requestedAssetId: string,
  clientVersion?: string
) {
  await assertDownloadAccess(user);

  if (typeof platform !== "string" || !/^[a-z0-9_-]{1,64}$/.test(platform)) {
    throw new AppApiError(400, "Invalid platform");
  }

  const config = getPlatformConfig(platform);
  await assertRateLimit(
    user.id,
    config.romset
      ? Number(process.env.ROMSET_UPDATE_REQUESTS_PER_MINUTE ?? "2000")
      : undefined
  );
  const assets = await listArchiveAssets(platform);
  const asset = assets.find((item) => item.id === requestedAssetId);
  if (!asset) throw new AppApiError(404, `${config.name} download not found`);

  const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const { error } = await getSupabaseAdmin().from("download_requests").insert({
    user_id: user.id,
    asset_id: asset.id,
    status: "authorized",
    provider: "archive_org",
    client_version: clientVersion?.slice(0, 64) || null,
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Failed to register download: ${error.message}`);

  return {
    asset: {
      id: asset.id,
      platform: asset.platform,
      title: asset.title,
      filename: asset.download_name,
      size: config.romset ? null : asset.file_size,
      sha256: null,
      install_mode: asset.install_mode,
      install_name: asset.install_name,
      romset_version: asset.romset_version,
    },
    downloadUrl: archiveFileUrl(asset.archive_identifier, asset.object_key),
    expiresAt,
  };
}

export async function authorizeRomsetUpdate(
  user: User,
  platform: unknown,
  filename: unknown,
  clientVersion?: string
) {
  await assertDownloadAccess(user);

  if (typeof platform !== "string" || !/^[a-z0-9_-]{1,64}$/.test(platform)) {
    throw new AppApiError(400, "Invalid platform");
  }
  if (
    typeof filename !== "string" ||
    filename !== filename.split("/").pop() ||
    filename !== filename.split("\\").pop() ||
    !/^[^<>:"/\\|?*\u0000-\u001f]+\.zip$/i.test(filename)
  ) {
    throw new AppApiError(400, "Invalid ROM filename");
  }

  const config = getPlatformConfig(platform);
  const romsetUpdate = config.romset;
  if (!romsetUpdate || !romsetUpdate.allow_updates) {
    throw new AppApiError(404, "Romset updates are not configured for this platform");
  }

  await assertRateLimit(
    user.id,
    Number(process.env.ROMSET_UPDATE_REQUESTS_PER_MINUTE ?? "2000")
  );

  const objectKey = `${romsetUpdate.directory}${filename}`;
  const id = assetId(platform, objectKey);
  const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const { error } = await getSupabaseAdmin().from("download_requests").insert({
    user_id: user.id,
    asset_id: id,
    status: "authorized",
    provider: "archive_org",
    client_version: clientVersion?.slice(0, 64) || null,
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Failed to register download: ${error.message}`);

  return {
    asset: {
      id,
      platform,
      title: titleOf(filename),
      filename,
      size: null,
      sha256: null,
      install_mode: "file" as const,
      install_name: titleOf(filename),
      romset_version: romsetUpdate.version,
    },
    downloadUrl: archiveFileUrl(romsetUpdate.identifier, objectKey),
    expiresAt,
  };
}
