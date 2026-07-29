import "server-only";

import { createHash } from "node:crypto";
import gamesCatalogJson from "@/data/games-catalog.json";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import {
  isGoogleDriveFolder,
  listGoogleDriveFolder,
  type GoogleDriveFile,
} from "@/services/google-drive-service";

type InstallMode = "file" | "extract";

interface PlatformConfig {
  id: string;
  name: string;
  extensions: string[];
  folder_id?: string;
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
  google_drive?: {
    root_folder_id?: string;
    bios_folder_id?: string;
    roms_folder_id?: string;
  };
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
    assets: number;
    skipped: number;
  }>;
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
  const configuredPlatforms = gamesCatalog.platforms.filter(
    (platform) =>
      Boolean(platform.folder_id?.trim()) &&
      (!normalizedFilter || platform.id === normalizedFilter)
  );

  if (normalizedFilter && configuredPlatforms.length === 0) {
    throw new Error(
      `Platform ${normalizedFilter} has no Google Drive folder configured`
    );
  }

  const result: GoogleDriveSyncResult = {
    folders: 0,
    assets: 0,
    skipped: 0,
    platforms: [],
  };

  if (!normalizedFilter) {
    const biosFolderId = gamesCatalog.google_drive?.bios_folder_id?.trim();
    if (biosFolderId) {
      const bios = await syncFolder(biosFolderId, null);
      result.folders += 1;
      result.assets += bios.assets;
      result.skipped += bios.skipped;
    }
  }

  for (const platform of configuredPlatforms) {
    const folderId = platform.folder_id!.trim();
    const synced = await syncFolder(folderId, platform);
    result.folders += 1;
    result.assets += synced.assets;
    result.skipped += synced.skipped;
    result.platforms.push({
      platform: platform.id,
      assets: synced.assets,
      skipped: synced.skipped,
    });
  }

  return result;
}

