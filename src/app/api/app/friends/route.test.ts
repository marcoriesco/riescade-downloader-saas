import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { AppApiError } from "@/lib/server/app-errors";

const mocked = vi.hoisted(() => ({ auth: vi.fn(), apply: vi.fn(), update: vi.fn(), page: vi.fn(), find: vi.fn() }));
vi.mock("@/lib/server/app-auth", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/server/app-auth")>(), authenticateAppRequest: mocked.auth,
}));
vi.mock("@/lib/server/supabase-admin", () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock("@/lib/server/friends", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/server/friends")>(),
  applyFriendAction: mocked.apply, updateSocialProfile: mocked.update, getFriendsPage: mocked.page, findFriendProfile: mocked.find,
}));
import { GET, POST, PUT } from "./route";

const code = "0123456789ABCDEF";
const originalFlag = process.env.RIESCADE_FRIENDS_ENABLED;
const request = (body: unknown) => new Request("https://riescade.example/api/app/friends", {
  method: "POST", headers: { Authorization: "Bearer ries_test", "Content-Type": "application/json" }, body: JSON.stringify(body),
});
beforeEach(() => {
  vi.clearAllMocks();
  process.env.RIESCADE_FRIENDS_ENABLED = "true";
  mocked.auth.mockResolvedValue({ id: "authenticated-actor" });
  mocked.apply.mockResolvedValue({ status: "pending" });
});
afterEach(() => {
  if (originalFlag === undefined) delete process.env.RIESCADE_FRIENDS_ENABLED;
  else process.env.RIESCADE_FRIENDS_ENABLED = originalFlag;
});

describe("friends HTTP authorization", () => {
  it("derives the actor from authentication regardless of spoofed body IDs", async () => {
    const response = await POST(request({ action: "request", targetCode: code.toLowerCase(), actorId: "victim", userId: "victim" }));
    expect(response.status).toBe(200);
    expect(mocked.apply).toHaveBeenCalledWith({}, "authenticated-actor", "request", code);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects expired sessions before changing relationships", async () => {
    mocked.auth.mockRejectedValueOnce(new AppApiError(401, "Sessão expirada."));
    expect((await POST(request({ action: "request", targetCode: code }))).status).toBe(401);
    expect(mocked.apply).not.toHaveBeenCalled();
  });
  it("keeps the feature disabled until the development migration is ready", async () => {
    process.env.RIESCADE_FRIENDS_ENABLED = "false";
    expect((await GET(new Request("https://riescade.example/api/app/friends"))).status).toBe(404);
    expect(mocked.auth).not.toHaveBeenCalled();
  });
  it.each([{ action: "other", targetCode: code }, { action: "request", targetCode: "bad" }])("rejects malformed social actions", async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocked.apply).not.toHaveBeenCalled();
  });
  it("rejects oversized bodies", async () => {
    expect((await POST(request({ action: "request", targetCode: code, extra: "x".repeat(3000) }))).status).toBe(413);
  });
  it("edits only the authenticated user's display name", async () => {
    mocked.update.mockResolvedValue({ display_name: "Player" });
    const response = await PUT(request({ displayName: " Player ", userId: "victim", friendCode: "0000000000000000" }));
    expect(response.status).toBe(200);
    expect(mocked.update).toHaveBeenCalledWith({}, "authenticated-actor", "Player");
  });
  it("rejects names containing control characters", async () => {
    expect((await PUT(request({ displayName: "Player\nOther" }))).status).toBe(400);
    expect(mocked.update).not.toHaveBeenCalled();
  });
  it("does not disclose database errors", async () => {
    mocked.apply.mockRejectedValueOnce(new Error("private table and key"));
    const response = await POST(request({ action: "request", targetCode: code }));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("private table");
  });
});
