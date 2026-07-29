import "server-only";

import { createHash } from "node:crypto";
import gamesCatalogJson from "@/data/games-catalog.json";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import {
  findUniqueGoogleDriveFolder,
  getGoogleSharedDriveId,
  isGoogleDriveFolder,
  listGoogleDriveFolder,
  type GoogleDriveFile,
} from "@/services/google-drive-service";

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
  drive_modified_at: string | null;
  active: boolean;
  synced_at: string;
}

export interface GoogleDriveSyncResult {
  folders: number;
  assets: number;
  skipped: number;
  platforms: Array<{
    platform: string;
    folderId: string;
    assets: number;
    skipped: number;
  }>;
  unmappedFolders: string[];
}

const gamesCatalog = gamesCatalogJson as GamesCatalog;
const UPSERT_BATCH_SIZE = 500;

function assetId(fileId: string): string {
  return createHash("sha256")
    .update(`google_drive\0${fileId}`)
    .digest("hex");
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function titleOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

function parseFileSize(value?: string): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function toAssetRow(
  file: GoogleDriveFile,
  folderId: string,
  platform: PlatformConfig | null,
  syncedAt: string
): DownloadAssetRow | null {
  if (
    isGoogleDriveFolder(file) ||
    file.capabilities?.canDownload === false ||
    !file.webContentLink
  ) {
    return null;
  }

  const installMode: InstallMode =
    platform?.install_mode === "extract" ? "extract" : "file";
  const title = titleOf(file.name);

  return {
    id: assetId(file.id),
    drive_file_id: file.id,
    drive_folder_id: folderId,
    category: platform ? "rom" : "bios",
    platform: platform?.id ?? null,
    filename: file.name,
    title,
    mime_type: file.mimeType,
    file_size: parseFileSize(file.size),
    md5_checksum: file.md5Checksum?.toLowerCase() ?? null,
    web_content_link: file.webContentLink,
    install_mode: installMode,
    install_name: `${title}${platform?.install_extension ?? ""}`,
    romset_version: platform?.romset?.version ?? null,
    drive_modified_at: file.modifiedTime ?? null,
    active: true,
    synced_at: syncedAt,
  };
}

async function replaceFolderAssets(
  folderId: string,
  rows: DownloadAssetRow[]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error: deactivateError } = await supabase
    .from("download_assets")
    .update({ active: false })
    .eq("drive_folder_id", folderId);

  if (deactivateError) {
    throw new Error(
      `Failed to deactivate Google Drive assets: ${deactivateError.message}`
    );
  }

  for (let index = 0; index < rows.length; index += UPSERT_BATCH_SIZE) {
    const { error } = await supabase
      .from("download_assets")
      .upsert(rows.slice(index, index + UPSERT_BATCH_SIZE), {
        onConflict: "drive_file_id",
      });

    if (error) {
      throw new Error(`Failed to index Google Drive assets: ${error.message}`);
    }
  }
}

async function syncFolder(
  folderId: string,
  platform: PlatformConfig | null
): Promise<{ assets: number; skipped: number }> {
  const files = await listGoogleDriveFolder(folderId);
  const allowedExtensions = platform
    ? new Set(platform.extensions.map((extension) => extension.toLowerCase()))
    : null;
  const syncedAt = new Date().toISOString();
  const rows: DownloadAssetRow[] = [];
  let skipped = 0;

  for (const file of files) {
    if (
      allowedExtensions &&
      !allowedExtensions.has(extensionOf(file.name))
    ) {
      skipped += 1;
      continue;
    }

    const row = toAssetRow(file, folderId, platform, syncedAt);
    if (!row) {
      skipped += 1;
      continue;
    }
    rows.push(row);
  }

  await replaceFolderAssets(folderId, rows);
  return { assets: rows.length, skipped };
}

export async function syncGoogleDriveCatalog(
  platformFilter?: string
): Promise<GoogleDriveSyncResult> {
  const normalizedFilter = platformFilter?.trim().toLowerCase();
  const selectedPlatforms = gamesCatalog.platforms.filter(
    (platform) => !normalizedFilter || platform.id === normalizedFilter
  );

  if (normalizedFilter && selectedPlatforms.length === 0) {
    throw new Error(`Platform ${normalizedFilter} is not in the game catalog`);
  }

  const rootFolderId = getGoogleSharedDriveId();
  const romsFolder = await findUniqueGoogleDriveFolder(rootFolderId, "roms");
  const platformFolders = (await listGoogleDriveFolder(romsFolder.id)).filter(
    isGoogleDriveFolder
  );
  const folderNames = new Map<string, GoogleDriveFile>();

  for (const folder of platformFolders) {
    const normalizedName = folder.name.trim().toLocaleLowerCase();
    if (folderNames.has(normalizedName)) {
      throw new Error(
        `Google Drive platform folder "${folder.name}" is duplicated inside roms`
      );
    }
    folderNames.set(normalizedName, folder);
  }

  const result: GoogleDriveSyncResult = {
    folders: 0,
    assets: 0,
    skipped: 0,
    platforms: [],
    unmappedFolders: platformFolders
      .filter(
        (folder) =>
          !gamesCatalog.platforms.some(
            (platform) =>
              platform.id.toLocaleLowerCase() ===
              folder.name.trim().toLocaleLowerCase()
          )
      )
      .map((folder) => folder.name),
  };

  if (!normalizedFilter) {
    const biosFolder = await findUniqueGoogleDriveFolder(rootFolderId, "bios");
    const bios = await syncFolder(biosFolder.id, null);
    result.folders += 1;
    result.assets += bios.assets;
    result.skipped += bios.skipped;
  }

  for (const platform of selectedPlatforms) {
    const folder = folderNames.get(platform.id.toLocaleLowerCase());
    if (!folder) {
      if (normalizedFilter) {
        throw new Error(
          `Google Drive folder "roms/${platform.id}" was not found`
        );
      }
      continue;
    }

    const synced = await syncFolder(folder.id, platform);
    result.folders += 1;
    result.assets += synced.assets;
    result.skipped += synced.skipped;
    result.platforms.push({
      platform: platform.id,
      folderId: folder.id,
      assets: synced.assets,
      skipped: synced.skipped,
    });
  }

  return result;
}
