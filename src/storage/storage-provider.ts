export interface DownloadObject {
  bucket: string;
  objectKey: string;
  downloadName: string;
  contentType?: string | null;
}

export interface SignedDownload {
  url: string;
  expiresAt: string;
}

export interface DownloadObjectInfo {
  objectKey: string;
  size: number | null;
}

export interface StorageProvider {
  createDownloadUrl(
    object: DownloadObject,
    expiresInSeconds: number
  ): Promise<SignedDownload>;
  listDownloadObjects(
    bucket: string,
    prefix: string
  ): Promise<DownloadObjectInfo[]>;
}
