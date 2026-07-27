import { describe, expect, it } from "vitest";
import { hasActiveSubscription } from "./download-service";

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
