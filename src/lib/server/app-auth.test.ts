import { afterEach, describe, expect, it } from "vitest";
import { AppApiError, isDownloadTester, readBearerToken } from "./app-auth";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("app authentication helpers", () => {
  it("extracts a bearer token", () => {
    expect(readBearerToken("Bearer session-token")).toBe("session-token");
  });

  it("rejects missing authorization", () => {
    expect(() => readBearerToken(null)).toThrow(AppApiError);
  });

  it("matches only explicitly configured pilot users", () => {
    process.env.DOWNLOAD_TEST_USER_IDS = "user-a, user-b";
    expect(isDownloadTester("user-b")).toBe(true);
    expect(isDownloadTester("user-c")).toBe(false);
  });
});
