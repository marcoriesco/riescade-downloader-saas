import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import {
  assertFriendsEnabled, getFriendsPage, findFriendProfile, applyFriendAction,
  updateSocialProfile, validateFriendCode, validateFriendAction, validateDisplayName,
} from "@/lib/server/friends";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

function failure(error: unknown) {
  const status = error instanceof AppApiError ? error.status : 500;
  return NextResponse.json({ error: error instanceof AppApiError ? error.message : "Não foi possível acessar seus amigos." }, { status, headers });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 2048) throw new AppApiError(413, "Solicitação muito grande.");
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new AppApiError(400, "Solicitação inválida.");
  }
}

export async function GET(request: Request) {
  try {
    assertFriendsEnabled();
    const user = await authenticateAppRequest(request);
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (code !== null) {
      const profile = await findFriendProfile(getSupabaseAdmin(), user.id, validateFriendCode(code));
      return NextResponse.json({ profile }, { headers });
    }
    const pageText = url.searchParams.get("page") || "0";
    if (!/^[0-9]{1,3}$/.test(pageText)) throw new AppApiError(400, "Página inválida.");
    return NextResponse.json(await getFriendsPage(getSupabaseAdmin(), user.id, Number(pageText)), { headers });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    assertFriendsEnabled();
    const user = await authenticateAppRequest(request);
    const body = await readBody(request);
    const action = validateFriendAction(body.action);
    const code = validateFriendCode(body.targetCode);
    // Never accept actor/user IDs from the body; use the validated login.
    return NextResponse.json(await applyFriendAction(getSupabaseAdmin(), user.id, action, code), { headers });
  } catch (error) { return failure(error); }
}

export async function PUT(request: Request) {
  try {
    assertFriendsEnabled();
    const user = await authenticateAppRequest(request);
    const body = await readBody(request);
    const profile = await updateSocialProfile(getSupabaseAdmin(), user.id, validateDisplayName(body.displayName));
    return NextResponse.json({ profile }, { headers });
  } catch (error) { return failure(error); }
}
