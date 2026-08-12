import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertValidAppReleaseManifest,
  type PublishAppReleaseInput,
} from "./app-release-service";

const originalPublicKey = process.env.RIESCADE_UPDATE_PUBLIC_KEY;

afterEach(() => {
  if (originalPublicKey === undefined) delete process.env.RIESCADE_UPDATE_PUBLIC_KEY;
  else process.env.RIESCADE_UPDATE_PUBLIC_KEY = originalPublicKey;
});

function signedManifest(overrides: Partial<PublishAppReleaseInput> = {}): PublishAppReleaseInput {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  process.env.RIESCADE_UPDATE_PUBLIC_KEY = publicKey.export({ type: "spki", format: "pem" }).toString();
  const manifest = {
    version: "2.5.9",
    releaseNotes: "Transition release",
    zipUrl: "https://drive.usercontent.google.com/download?id=abcdefghij&export=download",
    assetName: "RIESCADE_OS_v2.5.9.7z",
    sha256: "a".repeat(64),
    size: 123456,
    ...overrides,
  };
  const payload = JSON.stringify({
    version: manifest.version,
    releaseNotes: manifest.releaseNotes,
    zipUrl: manifest.zipUrl,
    assetName: manifest.assetName,
    sha256: manifest.sha256,
    size: manifest.size,
  });
  return {
    ...manifest,
    signature: sign(null, Buffer.from(payload), privateKey).toString("base64"),
  };
}

describe("app release manifest validation", () => {
  it("accepts a correctly signed Google Drive release", () => {
    expect(() => assertValidAppReleaseManifest(signedManifest())).not.toThrow();
  });

  it("rejects an asset name that does not match the version", () => {
    expect(() =>
      assertValidAppReleaseManifest(signedManifest({ assetName: "RIESCADE_OS_v9.9.9.7z" }))
    ).toThrow("does not match version");
  });

  it("rejects downloads from an unapproved host", () => {
    expect(() =>
      assertValidAppReleaseManifest(signedManifest({ zipUrl: "https://example.com/update.7z" }))
    ).toThrow("not allowed");
  });

  it("rejects a manifest changed after signing", () => {
    const manifest = signedManifest();
    manifest.size += 1;
    expect(() => assertValidAppReleaseManifest(manifest)).toThrow("Invalid release manifest signature");
  });
});
