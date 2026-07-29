import type { User } from "@supabase/supabase-js";
import gamesCatalogJson from "@/data/games-catalog.json";
import { AppApiError, isDownloadTester } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const DATABASE_PAGE_SIZE = 1000;

type InstallMode = "file" | "extract";

interface PlatformConfig {
  id: string;
  name: string;
  extensions: string[];
  install_mode?: InstallMode;
  install_extension?: string;
  romset?: {
    version: string;
    catalog: string;
    allow_downloads: boolean;
    allow_updates: boolean;
  };
}

interface GamesCatalog {
  platforms: PlatformConfig[];
}

interface DownloadAssetRow {
  id: string;
  drive_file_id: string;
  drive_folder_id: string;
  category: "bios" | "rom";
  platform: string | null;
  filename: string;
  title: string;
  mime_type: string;
  file_size: number | null;
  md5_checksum: string | null;
  web_content_link: string;
  install_mode: InstallMode;
  install_name: string;
  romset_version: string | null;
  active: boolean;
}

const gamesCatalog = gamesCatalogJson as GamesCatalog;

function getPlatformConfig(platform: string): PlatformConfig {
  const config = gamesCatalog.platforms.find(
    (item) => item.id.toLowerCase() === platform.toLowerCase()
  );
  if (!config) throw new AppApiError(404, "Platform not found");
  return {
    ...config,
    install_mode: config.install_mode === "extract" ? "extract" : "file",
  };
}

function mapAsset(asset: DownloadAssetRow) {
  return {
    id: asset.id,
    title: asset.title,
    download_name: asset.filename,
    file_size: asset.file_size,
    sha256: null,
    install_mode: asset.install_mode,
    install_name: asset.install_name,
    romset_version: asset.romset_version,
  };
}

async function listIndexedPlatformAssets(
  platform: string
): Promise<DownloadAssetRow[]> {
  const assets: DownloadAssetRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await getSupabaseAdmin()
      .from("download_assets")
      .select(
        "id,drive_file_id,drive_folder_id,category,platform,filename,title,mime_type,file_size,md5_checksum,web_content_link,install_mode,install_name,romset_version,active"
      )
      .eq("category", "rom")
      .eq("platform", platform)
      .eq("active", true)
      .order("title", { ascending: true })
      .range(offset, offset + DATABASE_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to load download catalog: ${error.message}`);
    }

    const page = (data ?? []) as DownloadAssetRow[];
    assets.push(...page);
    if (page.length < DATABASE_PAGE_SIZE) break;
    offset += DATABASE_PAGE_SIZE;
  }

  return assets;
}

async function listIndexedBiosAssets(): Promise<DownloadAssetRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_assets")
    .select(
      "id,drive_file_id,drive_folder_id,category,platform,filename,title,mime_type,file_size,md5_checksum,web_content_link,install_mode,install_name,romset_version,active"
    )
    .eq("category", "bios")
    .eq("active", true)
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to load BIOS catalog: ${error.message}`);
  }
  return (data ?? []) as DownloadAssetRow[];
}

async function findIndexedAsset(
  platform: string,
  assetId: string
): Promise<DownloadAssetRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_assets")
    .select(
      "id,drive_file_id,drive_folder_id,category,platform,filename,title,mime_type,file_size,md5_checksum,web_content_link,install_mode,install_name,romset_version,active"
    )
    .eq("id", assetId)
    .eq("category", "rom")
    .eq("platform", platform)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find Google Drive asset: ${error.message}`);
  }
  return (data as DownloadAssetRow | null) ?? null;
}

async function findIndexedAssetByFilename(
  platform: string,
  filename: string
): Promise<DownloadAssetRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_assets")
    .select(
      "id,drive_file_id,drive_folder_id,category,platform,filename,title,mime_type,file_size,md5_checksum,web_content_link,install_mode,install_name,romset_version,active"
    )
    .eq("category", "rom")
    .eq("platform", platform)
    .eq("filename", filename)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find Google Drive asset: ${error.message}`);
  }
  return (data as DownloadAssetRow | null) ?? null;
}

async function findIndexedBiosAsset(
  assetId: string
): Promise<DownloadAssetRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_assets")
    .select(
      "id,drive_file_id,drive_folder_id,category,platform,filename,title,mime_type,file_size,md5_checksum,web_content_link,install_mode,install_name,romset_version,active"
    )
    .eq("id", assetId)
    .eq("category", "bios")
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find Google Drive BIOS asset: ${error.message}`);
  }
  return (data as DownloadAssetRow | null) ?? null;
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

async function assertRateLimit(
  userId: string,
  configuredLimit?: number
): Promise<void> {
  const limit =
    configuredLimit ??
    Number(process.env.DOWNLOAD_REQUESTS_PER_MINUTE ?? "10");
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

export async function listBiosAssets() {
  const assets = await listIndexedBiosAssets();
  return {
    assets: assets.map(mapAsset),
  };
}

export async function listPlatformAssets(platform: string) {
  const config = getPlatformConfig(platform);
  const assets = await listIndexedPlatformAssets(config.id);
  return {
    assets: assets.map(mapAsset),
    detailsUrl: null,
    torrentUrl: null,
    romsetVersion: config.romset?.version ?? null,
    supportsRomsetUpdate: Boolean(config.romset?.allow_updates),
    supportsRomsetDownloads: Boolean(config.romset?.allow_downloads),
    supportsFullPlatformDownload: false,
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
  if (!romset?.allow_downloads) {
    throw new AppApiError(
      404,
      "Romset downloads are not configured for this platform"
    );
  }

  const assets = await listIndexedPlatformAssets(config.id);
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = normalizedSearch
    ? assets.filter(
        (asset) =>
          asset.title.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
          asset.filename.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      )
    : assets;
  const safeOffset = Math.max(0, Math.trunc(offset));
  const safeLimit = Math.min(1000, Math.max(1, Math.trunc(limit)));

  return {
    platform: config.id,
    version: romset.version,
    total: filtered.length,
    offset: safeOffset,
    limit: safeLimit,
    assets: filtered.slice(safeOffset, safeOffset + safeLimit).map((asset) => ({
      id: asset.id,
      title: asset.title,
      download_name: asset.filename,
      file_size: asset.file_size,
      romset_version: asset.romset_version,
    })),
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

async function authorizeIndexedAsset(
  user: User,
  platform: string,
  asset: DownloadAssetRow,
  clientVersion?: string
) {
  const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const { error } = await getSupabaseAdmin().from("download_requests").insert({
    user_id: user.id,
    asset_id: asset.id,
    status: "authorized",
    provider: "google_drive",
    client_version: clientVersion?.slice(0, 64) || null,
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Failed to register download: ${error.message}`);

  return {
    asset: {
      id: asset.id,
      platform,
      title: asset.title,
      filename: asset.filename,
      size: asset.file_size,
      sha256: null,
      install_mode: asset.install_mode,
      install_name: asset.install_name,
      romset_version: asset.romset_version,
    },
    downloadUrl: asset.web_content_link,
    expiresAt,
  };
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
  if (!/^[a-f0-9]{64}$/.test(requestedAssetId)) {
    throw new AppApiError(400, "Invalid asset");
  }

  const config = getPlatformConfig(platform);
  await assertRateLimit(
    user.id,
    config.romset
      ? Number(process.env.ROMSET_UPDATE_REQUESTS_PER_MINUTE ?? "2000")
      : undefined
  );

  const asset = await findIndexedAsset(config.id, requestedAssetId);
  if (!asset) {
    throw new AppApiError(404, `${config.name} download not found`);
  }

  return authorizeIndexedAsset(user, config.id, asset, clientVersion);
}

export async function authorizeBiosDownload(
  user: User,
  requestedAssetId: string,
  clientVersion?: string
) {
  await assertDownloadAccess(user);
  if (!/^[a-f0-9]{64}$/.test(requestedAssetId)) {
    throw new AppApiError(400, "Invalid asset");
  }

  await assertRateLimit(user.id);
  const asset = await findIndexedBiosAsset(requestedAssetId);
  if (!asset) {
    throw new AppApiError(404, "BIOS download not found");
  }

  return authorizeIndexedAsset(user, "bios", asset, clientVersion);
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
  if (!config.romset?.allow_updates) {
    throw new AppApiError(
      404,
      "Romset updates are not configured for this platform"
    );
  }

  await assertRateLimit(
    user.id,
    Number(process.env.ROMSET_UPDATE_REQUESTS_PER_MINUTE ?? "2000")
  );

  const asset = await findIndexedAssetByFilename(config.id, filename);
  if (!asset) {
    throw new AppApiError(404, `${config.name} update not found`);
  }

  return authorizeIndexedAsset(user, config.id, asset, clientVersion);
}
