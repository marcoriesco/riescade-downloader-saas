export interface StorageConfig {
  provider: "s3";
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  downloadUrlTtl: number;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function parseDownloadUrlTtl(value: string | undefined): number {
  const ttl = Number(value ?? "300");
  if (!Number.isInteger(ttl) || ttl < 60 || ttl > 900) {
    throw new Error("STORAGE_DOWNLOAD_URL_TTL must be between 60 and 900 seconds");
  }
  return ttl;
}

export function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER ?? "s3").trim().toLowerCase();
  if (provider !== "s3") {
    throw new Error(`Unsupported storage provider: ${provider}`);
  }

  return {
    provider: "s3",
    endpoint: required("STORAGE_ENDPOINT"),
    region: required("STORAGE_REGION"),
    bucket: required("STORAGE_BUCKET"),
    accessKeyId: required("STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: required("STORAGE_SECRET_ACCESS_KEY"),
    downloadUrlTtl: parseDownloadUrlTtl(
      process.env.STORAGE_DOWNLOAD_URL_TTL
    ),
  };
}
