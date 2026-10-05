import { describe, expect, it } from "vitest";
import { resolveDesktopClient } from "./desktop-clients";

describe("desktop login clients", () => {
  it("keeps the existing OS callback for requests without a client", () => {
    expect(resolveDesktopClient(undefined).callback).toBe("riescade://auth/callback");
    expect(resolveDesktopClient("os").callback).toBe("riescade://auth/callback");
  });
  it("uses a separate fixed callback for RetroBat", () => {
    expect(resolveDesktopClient("retrobat", "riescade-retrobat://auth/callback"))
      .toEqual({ id: "retrobat", name: "RIESCADE RetroBat", callback: "riescade-retrobat://auth/callback" });
  });
  it("rejects unknown clients and arbitrary callbacks", () => {
    for (const client of ["evil", "constructor", "__proto__", {}, 1, ""]) {
      expect(() => resolveDesktopClient(client)).toThrow();
    }
    for (const callback of ["https://evil.example", "riescade://auth/callback", "riescade-retrobat://evil/callback", "riescade-retrobat://auth/callback?code=x"]) {
      expect(() => resolveDesktopClient("retrobat", callback)).toThrow();
    }
  });
});
