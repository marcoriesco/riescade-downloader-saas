import { afterEach, describe, expect, it } from "vitest";
import { getStorageConfig, parseDownloadUrlTtl } from "./storage-config";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("storage config", () => {
  it("uses a five-minute signed URL by default", () => {
    expect(parseDownloadUrlTtl(undefined)).toBe(300);
  });

  it("rejects URLs that live too long", () => {
    expect(() => parseDownloadUrlTtl("901")).toThrow(
      "must be between 60 and 900"
    );
  });

  it("loads a bucket-restricted S3-compatible configuration", () => {
    Object.assign(process.env, {
      STORAGE_PROVIDER: "s3",
      STORAGE_ENDPOINT: "https://s3.us-east-005.backblazeb2.com",
      STORAGE_REGION: "us-east-005",
      STORAGE_BUCKET: "roms.snes",
      STORAGE_ACCESS_KEY_ID: "test-key-id",
      STORAGE_SECRET_ACCESS_KEY: "test-secret",
      STORAGE_DOWNLOAD_URL_TTL: "300",
    });

    expect(getStorageConfig()).toMatchObject({
      provider: "s3",
      bucket: "roms.snes",
      downloadUrlTtl: 300,
    });
  });
});
