import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
  type GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  DownloadObject,
  DownloadObjectInfo,
  SignedDownload,
  StorageProvider,
} from "../storage-provider";
import type { StorageConfig } from "../storage-config";

function contentDisposition(filename: string): string {
  const safeAscii = filename
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\\r\n]/g, "_");
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return `attachment; filename="${safeAscii}"; filename*=UTF-8''${encoded}`;
}

export class S3StorageProvider implements StorageProvider {
  private client: S3Client | null = null;

  constructor(private readonly config: StorageConfig) {}

  private getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        endpoint: this.config.endpoint,
        region: this.config.region,
        forcePathStyle: true,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    }
    return this.client;
  }

  async createDownloadUrl(
    object: DownloadObject,
    expiresInSeconds: number
  ): Promise<SignedDownload> {
    const input: GetObjectCommandInput = {
      Bucket: object.bucket || this.config.bucket,
      Key: object.objectKey,
      ResponseContentDisposition: contentDisposition(object.downloadName),
    };

    if (object.contentType) {
      input.ResponseContentType = object.contentType;
    }

    const url = await getSignedUrl(this.getClient(), new GetObjectCommand(input), {
      expiresIn: expiresInSeconds,
    });

    return {
      url,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };
  }

  async listDownloadObjects(
    bucket: string,
    prefix: string
  ): Promise<DownloadObjectInfo[]> {
    const response = await this.getClient().send(new ListObjectsV2Command({
      Bucket: bucket || this.config.bucket,
      Prefix: prefix,
    }));
    return (response.Contents ?? [])
      .filter((object) => typeof object.Key === "string")
      .map((object) => ({
        objectKey: object.Key!,
        size: typeof object.Size === "number" ? object.Size : null,
      }));
  }
}
