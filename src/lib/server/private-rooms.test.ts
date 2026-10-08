import { expect, it } from "vitest";
import { roomStep } from "./private-rooms";
import type { SupabaseClient } from "@supabase/supabase-js";
it("rejects the retired room protocol without accessing the database", async () => {
  await expect(
    roomStep({} as SupabaseClient, "actor", { step: "claim" }),
  ).rejects.toMatchObject({ status: 410 });
});
