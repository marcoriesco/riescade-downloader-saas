import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn(), authenticate: vi.fn() }));
vi.mock("@/lib/server/app-auth", () => {
  class AppApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
  }
  return { AppApiError, authenticateSupabaseRequest: mocks.authenticate };
});
vi.mock("@/lib/server/desktop-auth", () => ({
  createDesktopAuthorizationCode: mocks.create,
  validateDesktopAuthInput: (state: unknown, challenge: unknown) => ({ state, challenge }),
}));
import { GET, POST } from "./route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "user-test" });
  mocks.create.mockResolvedValue("test-code");
});
function request(extra = {}) {
  return new Request("https://www.riescade.com.br/api/app/auth/authorize", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "state-test", challenge: "challenge-test", ...extra }),
  });
}
describe("desktop authorization callbacks", () => {
  it("advertises the independent callback without creating authorization codes", async () => {
    const result = await GET();
    expect((await result.json()).callbacks.retrobat).toBe("riescade-retrobat://auth/callback");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("preserves old desktop requests", async () => {
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect((await result.json()).callbackUrl).toBe("riescade://auth/callback?code=test-code&state=state-test");
  });
  it("routes the Rust client to its own callback", async () => {
    const result = await POST(request({ client: "retrobat", redirectUri: "riescade-retrobat://auth/callback" }));
    expect(result.status).toBe(200);
    expect((await result.json()).callbackUrl).toBe("riescade-retrobat://auth/callback?code=test-code&state=state-test");
  });
  it("rejects an arbitrary callback before generating a code", async () => {
    const result = await POST(request({ client: "retrobat", redirectUri: "https://evil.example" }));
    expect(result.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
