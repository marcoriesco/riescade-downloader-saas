import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { assertFriendsEnabled } from "@/lib/server/friends";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { socialSnapshot, heartbeat, setPresenceMode, createInvitation, respondInvitation, dismissInvitation, closeRoom, invitationPreferences, invitationProgress, hostedSession, hostedConnection } from "@/lib/server/social-sessions";
import { roomStep } from '@/lib/server/private-rooms';

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof AppApiError ? error.message : "Não foi possível atualizar a sessão online." },
    { status: error instanceof AppApiError ? error.status : 500, headers });
}

export async function GET(request: Request) {
  try {
    assertFriendsEnabled();
    const user = await authenticateAppRequest(request);
    return NextResponse.json(await socialSnapshot(getSupabaseAdmin(), user.id), { headers });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    assertFriendsEnabled();
    const user = await authenticateAppRequest(request);
    const text = await request.text();
    if (text.length > 4096) throw new AppApiError(413, "Solicitação muito grande.");
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    } catch { throw new AppApiError(400, "Solicitação inválida."); }
    const db = getSupabaseAdmin();
    let data;
    switch (body.action) {
      case "heartbeat": data = await heartbeat(db, user.id, body); break;
      case "presence": data = await setPresenceMode(db, user.id, body.mode); break;
      case "invite": data = await createInvitation(db, user.id, body); break;
      case "respond": data = await respondInvitation(db, user.id, body); break;
      case "dismiss": data = await dismissInvitation(db, user.id, body); break;
      case "close": data = await closeRoom(db, user.id, body); break;
      case "preferences": data=await invitationPreferences(db,user.id,body); break;
      case "progress": data=await invitationProgress(db,user.id,body); break;
      case "hosted": data=await hostedSession(db,user.id,body); break;
      case "hosted-connection": data=await hostedConnection(db,user.id,body); break;
      case "room": data = await roomStep(db, user.id, body); break;
      default: throw new AppApiError(400, "Ação de sessão inválida.");
    }
    return NextResponse.json(data, { headers });
  } catch (error) { return failure(error); }
}
