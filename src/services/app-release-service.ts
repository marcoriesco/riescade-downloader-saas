import { verify } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export interface AppReleaseManifest {
  version: string;
  releaseNotes: string;
  zipUrl: string;
  assetName: string;
  sha256: string;
  size: number;
  signature: string;
}

export interface PublishAppReleaseInput extends AppReleaseManifest {
  driveFileId?: string;
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const ASSET_PATTERN = /^RIESCADE_OS_v\d+\.\d+\.\d+\.(?:7z|zip)$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SIGNATURE_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const MAX_UPDATE_SIZE = 4 * 1024 * 1024 * 1024;
const ALLOWED_DOWNLOAD_HOSTS = new Set([
  "drive.google.com",
  "drive.usercontent.google.com",
]);

export function assertValidAppReleaseManifest(input: PublishAppReleaseInput): void {
  if (!VERSION_PATTERN.test(input.version)) throw new Error("Invalid release version");
  if (!ASSET_PATTERN.test(input.assetName)) throw new Error("Invalid release asset name");
  if (![`RIESCADE_OS_v${input.version}.7z`, `RIESCADE_OS_v${input.version}.zip`].includes(input.assetName)) {
    throw new Error("Release asset name does not match version");
  }
  if (!SHA256_PATTERN.test(input.sha256)) throw new Error("Invalid release SHA-256");
  if (!Number.isSafeInteger(input.size) || input.size <= 0 || input.size > MAX_UPDATE_SIZE) {
    throw new Error("Invalid release size");
  }
  if (!SIGNATURE_PATTERN.test(input.signature)) throw new Error("Invalid release signature");
  if (typeof input.releaseNotes !== "string" || input.releaseNotes.length > 10_000) {
    throw new Error("Invalid release notes");
  }

  const downloadUrl = new URL(input.zipUrl);
  if (downloadUrl.protocol !== "https:" || !ALLOWED_DOWNLOAD_HOSTS.has(downloadUrl.hostname)) {
    throw new Error("Release download URL is not allowed");
  }
  if (input.driveFileId && !/^[A-Za-z0-9_-]{10,200}$/.test(input.driveFileId)) {
    throw new Error("Invalid Google Drive file ID");
  }

  const publicKey = process.env.RIESCADE_UPDATE_PUBLIC_KEY?.replace(/\\n/g, "\n").trim();
  if (!publicKey) throw new Error("RIESCADE_UPDATE_PUBLIC_KEY is not configured");
  const signedPayload = JSON.stringify({
    version: input.version,
    releaseNotes: input.releaseNotes,
    zipUrl: input.zipUrl,
    assetName: input.assetName,
    sha256: input.sha256,
    size: input.size,
  });
  const validSignature = verify(
    null,
    Buffer.from(signedPayload, "utf8"),
    publicKey,
    Buffer.from(input.signature, "base64")
  );
  if (!validSignature) throw new Error("Invalid release manifest signature");
}

export async function publishAppRelease(input: PublishAppReleaseInput): Promise<void> {
  assertValidAppReleaseManifest(input);

  const { error } = await getSupabaseAdmin().from("app_releases").insert({
    version: input.version,
    release_notes: input.releaseNotes,
    download_url: input.zipUrl,
    asset_name: input.assetName,
    sha256: input.sha256,
    size: input.size,
    signature: input.signature,
    drive_file_id: input.driveFileId || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error(`Release ${input.version} is already published`);
    throw new Error(`Failed to publish app release: ${error.message}`);
  }
}

export async function getLatestAppRelease(): Promise<AppReleaseManifest | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("app_releases")
    .select("version,release_notes,download_url,asset_name,sha256,size,signature")
    .order("version_major", { ascending: false })
    .order("version_minor", { ascending: false })
    .order("version_patch", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load latest app release: ${error.message}`);
  if (!data) return null;

  return {
    version: data.version,
    releaseNotes: data.release_notes,
    zipUrl: data.download_url,
    assetName: data.asset_name,
    sha256: data.sha256,
    size: Number(data.size),
    signature: data.signature,
  };
}
