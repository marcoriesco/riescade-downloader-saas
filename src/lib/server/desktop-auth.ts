import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase-admin";
import { AppApiError } from "./app-errors";

const AUTH_CODE_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const APP_TOKEN_PREFIX = "ries_";

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function randomUrlSafe(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function isDesktopAppToken(token: string): boolean {
  return token.startsWith(APP_TOKEN_PREFIX);
}

export function validateDesktopAuthInput(state: unknown, challenge: unknown) {
  if (
    typeof state !== "string" ||
    !/^[A-Za-z0-9_-]{43,128}$/.test(state) ||
    typeof challenge !== "string" ||
    !/^[A-Za-z0-9_-]{43,128}$/.test(challenge)
  ) {
    throw new AppApiError(400, "Invalid desktop authorization request");
  }
  return { state, challenge };
}

export async function createDesktopAuthorizationCode(
  userId: string,
  state: string,
  challenge: string
): Promise<string> {
  const code = randomUrlSafe(32);
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MS).toISOString();
  const { error } = await getSupabaseAdmin().from("app_auth_codes").insert({
    user_id: userId,
    code_hash: sha256(code),
    state_hash: sha256(state),
    pkce_challenge: challenge,
    expires_at: expiresAt,
  });
  if (error) throw error;
  return code;
}

export async function exchangeDesktopAuthorizationCode(
  code: unknown,
  state: unknown,
  verifier: unknown
): Promise<{ token: string; expiresAt: string; user: User }> {
  if (
    typeof code !== "string" ||
    !/^[A-Za-z0-9_-]{43,128}$/.test(code) ||
    typeof state !== "string" ||
    !/^[A-Za-z0-9_-]{43,128}$/.test(state) ||
    typeof verifier !== "string" ||
    !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)
  ) {
    throw new AppApiError(400, "Invalid authorization code exchange");
  }

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const codeHash = sha256(code);
  const { data: authCode, error } = await admin
    .from("app_auth_codes")
    .select("id,user_id,state_hash,pkce_challenge,expires_at,consumed_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (error || !authCode || authCode.consumed_at || authCode.expires_at <= now) {
    throw new AppApiError(401, "Authorization code is invalid or expired");
  }

  const receivedStateHash = Buffer.from(sha256(state), "hex");
  const expectedStateHash = Buffer.from(authCode.state_hash, "hex");
  const receivedChallenge = createHash("sha256")
    .update(verifier, "ascii")
    .digest("base64url");
  if (
    receivedStateHash.length !== expectedStateHash.length ||
    !timingSafeEqual(receivedStateHash, expectedStateHash) ||
    receivedChallenge !== authCode.pkce_challenge
  ) {
    throw new AppApiError(401, "Authorization verification failed");
  }

  const { data: consumed } = await admin
    .from("app_auth_codes")
    .update({ consumed_at: now })
    .eq("id", authCode.id)
    .is("consumed_at", null)
    .select("id")
    .maybeSingle();
  if (!consumed) {
    throw new AppApiError(401, "Authorization code was already used");
  }

  const rawToken = `${APP_TOKEN_PREFIX}${randomUrlSafe(48)}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const { error: sessionError } = await admin.from("app_sessions").insert({
    user_id: authCode.user_id,
    token_hash: sha256(rawToken),
    expires_at: expiresAt,
  });
  if (sessionError) throw sessionError;

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(authCode.user_id);
  if (userError || !userData.user) {
    throw new AppApiError(401, "User no longer exists");
  }
  return { token: rawToken, expiresAt, user: userData.user };
}

export async function authenticateDesktopToken(token: string): Promise<User> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data: session, error } = await admin
    .from("app_sessions")
    .select("id,user_id,expires_at,revoked_at")
    .eq("token_hash", sha256(token))
    .maybeSingle();

  if (error || !session || session.revoked_at || session.expires_at <= now) {
    throw new AppApiError(401, "Invalid or expired app session");
  }

  await admin
    .from("app_sessions")
    .update({ last_used_at: now })
    .eq("id", session.id);
  const { data, error: userError } =
    await admin.auth.admin.getUserById(session.user_id);
  if (userError || !data.user) {
    throw new AppApiError(401, "User no longer exists");
  }
  return data.user;
}

export async function revokeDesktopToken(token: string): Promise<void> {
  await getSupabaseAdmin()
    .from("app_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", sha256(token))
    .is("revoked_at", null);
}
