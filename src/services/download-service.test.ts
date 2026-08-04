import { describe, expect, it } from "vitest";
import {
  hasActiveSubscription,
  isReservedPlatformAsset,
} from "./download-service";
import { downloadPackageTitle, isExtractPackage } from "@/lib/download-package";
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

describe("game installation package convention", () => {
  it("extracts only files carrying the .extract.zip suffix", () => {
    expect(isExtractPackage("sfiii3.extract.zip")).toBe(true);
    expect(isExtractPackage("SFIII3.EXTRACT.ZIP")).toBe(true);
    expect(isExtractPackage("sfiii3.zip")).toBe(false);
    expect(isExtractPackage("sfiii3.7z")).toBe(false);
  });

  it("removes the extraction marker from the catalog title", () => {
    expect(downloadPackageTitle("sfiii3.extract.zip")).toBe("sfiii3");
    expect(downloadPackageTitle("meujogo.game.extract.zip")).toBe("meujogo.game");
    expect(downloadPackageTitle("pacman.zip")).toBe("pacman");
  });
});

describe("Google Drive catalog configuration", () => {
  it("discovers Google Drive folders dynamically from the platform catalog", () => {
    for (const platform of gamesCatalog.platforms) {
      expect(platform).not.toHaveProperty("folder_id");
      if ("romset" in platform && platform.romset) {
        expect(platform.romset).not.toHaveProperty("identifier");
        expect(platform.romset).not.toHaveProperty("metadata_url");
        expect(platform.romset).not.toHaveProperty("directory");
      }
    }

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
