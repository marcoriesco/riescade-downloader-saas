import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsert, listFolder } = vi.hoisted(() => ({
  upsert: vi.fn().mockResolvedValue({ error: null }),
  listFolder: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ from: () => ({
    update: () => ({ eq: async () => ({ error: null }) }),
    upsert,
  }) }),
}));
vi.mock("@/services/google-drive-service", () => ({
  getGoogleSharedDriveId: () => "root",
  findUniqueGoogleDriveFolder: async () => ({ id: "roms" }),
  isGoogleDriveFolder: (file: { mimeType: string }) => file.mimeType === "folder",
  listGoogleDriveFolder: listFolder,
}));

import { syncGoogleDriveCatalog } from "./google-drive-sync-service";

describe("full media catalog synchronization", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(["chihiro", "windows", "nes3d", "fightcade", "switch", "snes", "naomi"])(
    "indexes media independently of %s ROM extensions",
    async (platform) => {
      listFolder.mockImplementation(async (folder: string) => folder === "roms"
        ? [{ id: "platform-folder", name: platform, mimeType: "folder" }]
        : [
          { id: "media-file", name: "_media.zip", mimeType: "application/zip", size: "123", webContentLink: "https://drive.google.com/uc?id=media-file" },
          { id: "unrelated-file", name: "notes.unrecognized", mimeType: "text/plain", webContentLink: "https://drive.google.com/uc?id=unrelated-file" },
        ]);
      await syncGoogleDriveCatalog(platform);
      expect(upsert).toHaveBeenCalledTimes(1);
      expect(upsert.mock.calls[0][0]).toEqual([
        expect.objectContaining({ platform, filename: "_media.zip", active: true, category: "rom" }),
      ]);
    }
  );
});
