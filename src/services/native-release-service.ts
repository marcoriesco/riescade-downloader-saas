import { verify } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const NATIVE_RELEASE_PRODUCT = "riescade-native";

export interface NativeReleaseManifest {
  version: string;
  releaseNotes: string;
  zipUrl: string;
  assetName: string;
  sha256: string;
  size: number;
  signature: string;
}

export interface PublishNativeReleaseInput extends NativeReleaseManifest {
  driveFileId?: string;
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SIGNATURE_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const MAX_UPDATE_SIZE = 200 * 1024 * 1024;
const ALLOWED_DOWNLOAD_HOSTS = new Set([
  "drive.google.com",
  "drive.usercontent.google.com",
]);

// The product field keeps an RIESCADE OS signature from being replayed as a native update.
export function nativeReleaseSignedPayload(input: Omit<NativeReleaseManifest, "signature">): string {
  return JSON.stringify({
    product: NATIVE_RELEASE_PRODUCT,
    version: input.version,
    releaseNotes: input.releaseNotes,
    zipUrl: input.zipUrl,
    assetName: input.assetName,
    sha256: input.sha256,
    size: input.size,
  });
}

export function assertValidNativeReleaseManifest(input: PublishNativeReleaseInput): void {
  if (!VERSION_PATTERN.test(input.version)) throw new Error("Invalid release version");
  if (input.assetName !== `riescade-native-v${input.version}.zip`) {
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
  const validSignature = verify(
    null,
    Buffer.from(nativeReleaseSignedPayload(input), "utf8"),
    publicKey,
    Buffer.from(input.signature, "base64")
  );
  if (!validSignature) throw new Error("Invalid release manifest signature");
}

export async function publishNativeRelease(input: PublishNativeReleaseInput): Promise<void> {
  assertValidNativeReleaseManifest(input);

  const { error } = await getSupabaseAdmin().from("native_releases").insert({
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
    throw new Error(`Failed to publish native release: ${error.message}`);
  }
}

export async function getLatestNativeRelease(): Promise<NativeReleaseManifest | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("native_releases")
    .select("version,release_notes,download_url,asset_name,sha256,size,signature")
    .order("version_major", { ascending: false })
    .order("version_minor", { ascending: false })
    .order("version_patch", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load latest native release: ${error.message}`);
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
