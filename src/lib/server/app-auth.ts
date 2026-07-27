import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase-admin";
import { AppApiError } from "./app-errors";
import {
  authenticateDesktopToken,
  isDesktopAppToken,
} from "./desktop-auth";

export { AppApiError } from "./app-errors";

export function readBearerToken(header: string | null): string {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token) {
    throw new AppApiError(401, "Missing or invalid authorization token");
  }
  return token;
}

export async function authenticateAppRequest(request: Request): Promise<User> {
  const token = readBearerToken(request.headers.get("authorization"));
  if (isDesktopAppToken(token)) {
    return authenticateDesktopToken(token);
  }
  return authenticateSupabaseToken(token);
}

export async function authenticateSupabaseRequest(request: Request): Promise<User> {
  const token = readBearerToken(request.headers.get("authorization"));
  if (isDesktopAppToken(token)) {
    throw new AppApiError(401, "A website login session is required");
  }
  return authenticateSupabaseToken(token);
}

async function authenticateSupabaseToken(token: string): Promise<User> {
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !data.user) {
    throw new AppApiError(401, "Invalid or expired session");
  }

  return data.user;
}

export function isDownloadTester(userId: string): boolean {
  return (process.env.DOWNLOAD_TEST_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(userId);
}
