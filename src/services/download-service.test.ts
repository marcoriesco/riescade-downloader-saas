import { describe, expect, it } from "vitest";
import {
  hasActiveSubscription,
  isReservedPlatformAsset,
} from "./download-service";
import gamesCatalog from "@/data/games-catalog.json";

describe("download access", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");

  it("accepts an active unexpired subscription", () => {
    expect(
      hasActiveSubscription(
        { status: "active", end_date: "2026-08-27T00:00:00.000Z" },
        now
      )
    ).toBe(true);
  });

  it("rejects an expired subscription", () => {
    expect(
      hasActiveSubscription(
        { status: "active", end_date: "2026-06-27T00:00:00.000Z" },
        now
      )
    ).toBe(false);
  });

  it("rejects a canceled subscription", () => {
    expect(
      hasActiveSubscription(
        { status: "canceled", end_date: "2026-08-27T00:00:00.000Z" },
        now
      )
    ).toBe(false);
  });
});

describe("game installation mode", () => {
  it.each([
    ["windows", ".game"],
    ["teknoparrot", ".game"],
    ["touhou", ".game"],
    ["gog", ".game"],
    ["bigfish", ".game"],
    ["ikemen", ".game"],
    ["mugen", ".game"],
    ["ouya", ".game"],
    ["popcap", ".game"],
  ])(
    "marks %s packages for automatic extraction into %s folders",
    (platform, installExtension) => {
      const config = gamesCatalog.platforms.find((item) => item.id === platform);
      expect(config?.install_mode).toBe("extract");
      expect(config?.install_extension).toBe(installExtension);
      expect(config?.extensions).toContain(".game");
      expect(config?.extensions).not.toContain(".zip");
    }
  );

  it("extracts ScummVM ZIPs without adding the .game suffix", () => {
    const config = gamesCatalog.platforms.find((item) => item.id === "scummvm");
    expect(config?.install_mode).toBe("extract");
    expect(config?.install_extension).toBeUndefined();
    expect(config?.extensions).toContain(".scummvm");
  });
});

describe("Google Drive catalog configuration", () => {
  it("discovers Google Drive folders dynamically without Archive.org configuration", () => {
    for (const platform of gamesCatalog.platforms) {
      expect(platform).not.toHaveProperty("folder_id");
      expect(platform).not.toHaveProperty("archive");
      if ("romset" in platform && platform.romset) {
        expect(platform.romset).not.toHaveProperty("identifier");
        expect(platform.romset).not.toHaveProperty("metadata_url");
        expect(platform.romset).not.toHaveProperty("details_url");
        expect(platform.romset).not.toHaveProperty("directory");
      }
    }

    expect(JSON.stringify(gamesCatalog)).not.toContain("archive.org");
    expect(gamesCatalog).not.toHaveProperty("google_drive");
  });

  it.each([
    ["mame", "v0.288"],
    ["fbneo", "v1.0.0.03"],
  ])("enables managed romset downloads and updates for %s", (platform, version) => {
    const config = gamesCatalog.platforms.find((item) => item.id === platform);
    expect(config?.romset).toMatchObject({
      version,
      allow_downloads: true,
      allow_updates: true,
    });
  });
});

describe("reserved platform assets", () => {
  it("keeps the full media pack out of game catalogs", () => {
    expect(isReservedPlatformAsset("_media.zip")).toBe(true);
    expect(isReservedPlatformAsset("_MEDIA.ZIP")).toBe(true);
    expect(isReservedPlatformAsset("game.zip")).toBe(false);
  });
});
