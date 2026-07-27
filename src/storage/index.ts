import type { StorageProvider } from "./storage-provider";
import { getStorageConfig } from "./storage-config";
import { S3StorageProvider } from "./providers/s3-storage-provider";

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    const config = getStorageConfig();
    storageProvider = new S3StorageProvider(config);
  }
  return storageProvider;
}
