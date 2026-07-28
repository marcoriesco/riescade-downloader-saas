import { createHash } from "crypto";
import type { User } from "@supabase/supabase-js";
import gamesCatalog from "@/data/games-catalog.json";
import { AppApiError, isDownloadTester } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const MEDIA_TYPES = new Set([
  "cartdridge", "cover", "cover3d", "coverback", "fanart", "logo",
  "manual", "marquee", "mix", "screenshot", "title", "video",
]);
const MEDIA_EXTENSIONS = new Set([
  ".webp", ".png", ".jpg", ".jpeg", ".gif", ".mp4", ".mkv", ".avi", ".pdf",
]);
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

interface PlatformConfig {
  id: string;
  name: string;
  extensions: string[];
  archive: {
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
}

function getPlatformConfig(platform: string): PlatformConfig {
  const config = gamesCatalog.platforms.find((item) => item.id === platform);
  if (!config) throw new AppApiError(404, "Platform not found");
  if (!config.archive.identifier) {
    throw new AppApiError(404, "Platform downloads are not configured yet");
  }
  return config;
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
  const metadataUrl =
    config.archive.metadata_url ||
    `https://archive.org/metadata/${encodeURIComponent(config.archive.identifier)}`;
  const response = await fetch(metadataUrl, {
    headers: { "User-Agent": "RIESCADE-Catalog/1.0" },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Archive.org metadata request failed (${response.status})`);
  }
  return (await response.json()) as ArchiveMetadata;
}

async function listArchiveAssets(platform: string): Promise<ArchiveAsset[]> {
  const config = getPlatformConfig(platform);
  const allowedExtensions = new Set(
    config.extensions.map((extension) => extension.toLowerCase())
  );
  const metadata = await getArchiveMetadata(config);

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
      object_key: file.name,
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

async function assertRateLimit(userId: string): Promise<void> {
  const limit = Number(process.env.DOWNLOAD_REQUESTS_PER_MINUTE ?? "10");
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
    })),
    detailsUrl: config.archive.details_url,
    torrentUrl: config.archive.torrent_url,
  };
}

export async function authorizeSnesDownload(
  user: User,
  requestedAssetId: string,
  clientVersion?: string,
  requestedMediaTypes?: unknown
) {
  return authorizePlatformDownload(
    user,
    "snes",
    requestedAssetId,
    clientVersion,
    requestedMediaTypes
  );
}

export async function authorizePlatformDownload(
  user: User,
  platform: unknown,
  requestedAssetId: string,
  clientVersion?: string,
  requestedMediaTypes?: unknown
) {
  await assertDownloadAccess(user);
  await assertRateLimit(user.id);

  if (typeof platform !== "string" || !/^[a-z0-9_-]{1,64}$/.test(platform)) {
    throw new AppApiError(400, "Invalid platform");
  }

  const config = getPlatformConfig(platform);
  const assets = await listArchiveAssets(platform);
  const asset = assets.find((item) => item.id === requestedAssetId);
  if (!asset) throw new AppApiError(404, `${config.name} download not found`);

  const metadata = await getArchiveMetadata(config);
  const gameBaseName = titleOf(asset.download_name);
  const mediaTypes = Array.isArray(requestedMediaTypes)
    ? [...new Set(requestedMediaTypes)]
        .filter((type): type is string => typeof type === "string" && MEDIA_TYPES.has(type))
        .slice(0, MEDIA_TYPES.size)
    : [];
  const media = mediaTypes.flatMap((type) => {
    const matchingFile = (metadata.files || []).find((file) => {
      if (typeof file.name !== "string" || file.source !== "original") return false;
      const normalized = file.name.replace(/\\/g, "/");
      const basename = normalized.split("/").pop() || normalized;
      const pathMatches =
        normalized.includes(`/media/${type}/`) ||
        normalized.startsWith(`media/${type}/`);
      return (
        pathMatches &&
        titleOf(basename) === gameBaseName &&
        MEDIA_EXTENSIONS.has(extensionOf(basename))
      );
    });
    if (!matchingFile?.name) return [];
    return [{
      type,
      filename: matchingFile.name.split("/").pop() || matchingFile.name,
      size:
        typeof matchingFile.size === "string" && /^\d+$/.test(matchingFile.size)
          ? Number(matchingFile.size)
          : null,
      downloadUrl: archiveFileUrl(config.archive.identifier, matchingFile.name),
    }];
  });

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
      size: asset.file_size,
      sha256: null,
    },
    downloadUrl: archiveFileUrl(config.archive.identifier, asset.object_key),
    expiresAt,
    media,
  };
}
