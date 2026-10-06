import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertValidNativeReleaseManifest,
  nativeReleaseSignedPayload,
  type PublishNativeReleaseInput,
} from "./native-release-service";

const originalPublicKey = process.env.RIESCADE_UPDATE_PUBLIC_KEY;

afterEach(() => {
  if (originalPublicKey === undefined) delete process.env.RIESCADE_UPDATE_PUBLIC_KEY;
  else process.env.RIESCADE_UPDATE_PUBLIC_KEY = originalPublicKey;
});

function signedManifest(overrides: Partial<PublishNativeReleaseInput> = {}): PublishNativeReleaseInput {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  process.env.RIESCADE_UPDATE_PUBLIC_KEY = publicKey.export({ type: "spki", format: "pem" }).toString();
  const manifest = {
    version: "0.3.0",
    releaseNotes: "Native update",
    zipUrl: "https://drive.usercontent.google.com/download?id=abcdefghij&export=download",
    assetName: "riescade-native-v0.3.0.zip",
    sha256: "a".repeat(64),
    size: 123456,
    ...overrides,
  };
  return {
    ...manifest,
    signature: sign(null, Buffer.from(nativeReleaseSignedPayload(manifest)), privateKey).toString("base64"),
  };
}

describe("native release manifest validation", () => {
  it("accepts a correctly signed Google Drive release", () => {
    expect(() => assertValidNativeReleaseManifest(signedManifest())).not.toThrow();
  });

  it("rejects an asset name that does not match the version", () => {
    expect(() =>
      assertValidNativeReleaseManifest(signedManifest({ assetName: "riescade-native-v9.9.9.zip" }))
    ).toThrow("does not match version");
  });

  it("rejects downloads from an unapproved host", () => {
    expect(() =>
      assertValidNativeReleaseManifest(signedManifest({ zipUrl: "https://example.com/update.zip" }))
    ).toThrow("not allowed");
  });

  it("rejects a manifest changed after signing", () => {
    const manifest = signedManifest();
    manifest.size += 1;
    expect(() => assertValidNativeReleaseManifest(manifest)).toThrow("Invalid release manifest signature");
  });

  it("rejects an RIESCADE OS signature replayed as a native release", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    process.env.RIESCADE_UPDATE_PUBLIC_KEY = publicKey.export({ type: "spki", format: "pem" }).toString();
    const manifest = {
      version: "0.3.0",
      releaseNotes: "",
      zipUrl: "https://drive.usercontent.google.com/download?id=abcdefghij",
      assetName: "riescade-native-v0.3.0.zip",
      sha256: "b".repeat(64),
      size: 10,
    };
    const osPayload = JSON.stringify(manifest);
    const signature = sign(null, Buffer.from(osPayload), privateKey).toString("base64");
    expect(() => assertValidNativeReleaseManifest({ ...manifest, signature })).toThrow(
      "Invalid release manifest signature"
    );
  });
});
