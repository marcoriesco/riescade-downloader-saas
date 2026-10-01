import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const C = "00000000-0000-4000-8000-000000000003";
let db: PGlite;

async function action(actor: string, target: string, operation: string) {
  const result = await db.query<{ status: string }>(
    "select public.social_apply_action($1::uuid, $2::uuid, $3) as status", [actor, target, operation]
  );
  return result.rows[0].status;
}

beforeAll(async () => {
  db = await PGlite.create();
  // Only emulate Supabase's roles and FK target. Apply production SQL unchanged.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    insert into auth.users values ('${A}'), ('${B}'), ('${C}');
  `);
  await db.exec(readFileSync(resolve("supabase/migrations/20261001160000_add_riescade_friends.sql"), "utf8"));
}, 30000);

beforeEach(async () => {
  await db.exec(`reset role; truncate public.social_profiles cascade;
    insert into public.social_profiles (user_id) values ('${A}'), ('${B}'), ('${C}');
    set role service_role;`);
});
afterAll(async () => { if (db) await db.close(); });

describe("friends migration executed in local Postgres", () => {
  it("creates one relationship and requires recipient acceptance", async () => {
    expect(await action(A, B, "request")).toBe("pending");
    await expect(action(A, B, "accept")).rejects.toThrow("SOCIAL_FORBIDDEN");
    await expect(action(C, B, "accept")).rejects.toThrow("SOCIAL_FORBIDDEN");
    expect(await action(B, A, "accept")).toBe("accepted");
    expect(await action(B, A, "accept")).toBe("accepted");
    const { rows } = await db.query<{ accepted_at: string | null }>("select * from public.social_relationships");
    expect(rows).toHaveLength(1);
    expect(rows[0].accepted_at).not.toBeNull();
  });

  it("does not auto-accept crossed requests or spend quota on duplicates", async () => {
    await action(A, B, "request");
    expect(await action(A, B, "request")).toBe("pending");
    await expect(action(B, A, "request")).rejects.toThrow("SOCIAL_INCOMING_REQUEST");
    const { rows } = await db.query("select request_count from public.social_request_limits");
    expect(rows).toEqual([{ request_count: 1 }]);
  });

  it("only sender cancels and only recipient declines", async () => {
    await action(A, B, "request");
    await expect(action(B, A, "cancel")).rejects.toThrow("SOCIAL_FORBIDDEN");
    await expect(action(A, B, "decline")).rejects.toThrow("SOCIAL_FORBIDDEN");
    expect(await action(B, A, "decline")).toBe("removed");
    expect(await action(B, A, "decline")).toBe("removed");
    await action(A, B, "request");
    expect(await action(A, B, "cancel")).toBe("removed");
  });

  it("removes accepted friends from either side, but not pending requests", async () => {
    await action(A, B, "request");
    await expect(action(A, B, "remove")).rejects.toThrow("SOCIAL_FORBIDDEN");
    await action(B, A, "accept");
    expect(await action(B, A, "remove")).toBe("removed");
    expect(await action(A, B, "remove")).toBe("removed");
  });

  it("blocks atomically remove friendship and prevent either direction of request", async () => {
    await action(A, B, "request");
    await action(B, A, "accept");
    expect(await action(A, B, "block")).toBe("blocked");
    expect((await db.query("select * from public.social_relationships")).rows).toHaveLength(0);
    await expect(action(A, B, "request")).rejects.toThrow("SOCIAL_UNAVAILABLE");
    await expect(action(B, A, "request")).rejects.toThrow("SOCIAL_UNAVAILABLE");
    await action(B, A, "unblock");
    await expect(action(B, A, "request")).rejects.toThrow("SOCIAL_UNAVAILABLE");
    await action(A, B, "unblock");
    expect((await db.query("select * from public.social_relationships")).rows).toHaveLength(0);
    expect(await action(B, A, "request")).toBe("pending");
  });

  it("rejects self requests, invalid actions and missing profiles", async () => {
    await expect(action(A, A, "request")).rejects.toThrow("SOCIAL_INVALID_TARGET");
    await expect(action(A, B, "other")).rejects.toThrow("SOCIAL_INVALID_ACTION");
    await expect(action(A, "00000000-0000-4000-8000-000000000004", "request")).rejects.toThrow("SOCIAL_UNAVAILABLE");
  });

  it("uses persistent quotas that cannot be bypassed by cancelling requests", async () => {
    for (let i = 0; i < 20; i++) {
      await action(A, B, "request");
      await action(A, B, "cancel");
    }
    await expect(action(A, B, "request")).rejects.toThrow("SOCIAL_RATE_LIMIT");
    expect((await db.query("select request_count from public.social_request_limits")).rows).toEqual([{ request_count: 20 }]);
    await db.exec("update public.social_request_limits set window_started_at = now() - interval '2 hours'");
    expect(await action(A, B, "request")).toBe("pending");
  });

  it.each(["anon", "authenticated"])("denies %s direct reads, writes and RPC actor spoofing", async role => {
    await db.exec(`set role ${role}`);
    await expect(db.query("select * from public.social_profiles")).rejects.toThrow("permission denied");
    await expect(db.query("select * from public.social_relationships")).rejects.toThrow("permission denied");
    await expect(db.query("select * from public.social_blocks")).rejects.toThrow("permission denied");
    await expect(db.query("select * from public.social_request_limits")).rejects.toThrow("permission denied");
    await expect(action(A, B, "request")).rejects.toThrow("permission denied");
    await expect(db.query("delete from public.social_profiles")).rejects.toThrow("permission denied");
  });

  it("enables RLS on all social tables and enforces schema constraints", async () => {
    const { rows } = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where relname in ('social_profiles','social_relationships','social_blocks','social_request_limits')"
    );
    expect(rows).toHaveLength(4);
    expect(rows.every(row => row.relrowsecurity)).toBe(true);
    await expect(db.query("update public.social_profiles set display_name = '' where user_id = $1", [A])).rejects.toThrow("social_profiles_name");
    await expect(db.query("insert into public.social_relationships(requester_id,recipient_id) values ($1,$1)", [A])).rejects.toThrow("check constraint");
    await action(A, B, "request");
    await expect(db.query("insert into public.social_relationships(requester_id,recipient_id) values ($1,$2)", [B, A])).rejects.toThrow("unique constraint");
  });
});
