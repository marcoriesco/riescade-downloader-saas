import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "./app-errors";
import { checkDatabaseError, ensureSocialProfile, profileByCode, validateFriendCode } from "./friends";

export interface InvitationGame {
  title: string; system: string; core: string;
  content_hash: string; core_hash: string; emulator_hash: string;
}

export function validateUuid(value: unknown): string {
  if (typeof value !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) {
    throw new AppApiError(400, "Identificador inválido.");
  }
  return value.toLowerCase();
}

export function validateInvitationGame(value: unknown): InvitationGame {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AppApiError(400, "Jogo inválido.");
  const game = value as Record<string, unknown>;
  if (typeof game.title !== "string" || [...game.title.trim()].length < 1 || [...game.title.trim()].length > 128 || /[\x00-\x1f\x7f]/.test(game.title)
    || typeof game.system !== "string" || !/^[a-zA-Z0-9_-]{1,40}$/.test(game.system)
    || typeof game.core !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(game.core)) throw new AppApiError(400, "Jogo inválido.");
  const hash = (key: string) => {
    const text = game[key];
    if (typeof text !== "string" || !/^[a-f0-9]{64}$/i.test(text)) throw new AppApiError(400, "Identificação do jogo inválida.");
    return text.toLowerCase();
  };
  // Explicit projection: never persist user-supplied paths, URLs or launch args.
  return { title: game.title.trim(), system: game.system, core: game.core,
    content_hash: hash("content_hash"), core_hash: hash("core_hash"), emulator_hash: hash("emulator_hash") };
}

export async function socialSnapshot(db: SupabaseClient, actor: string) {
  await ensureSocialProfile(db, actor);
  const { data, error } = await db.rpc("social_session_snapshot", { p_actor: actor });
  checkDatabaseError(error);
  return data;
}

export async function heartbeat(db: SupabaseClient, actor: string, body: Record<string, unknown>) {
  const device = validateUuid(body.deviceId);
  if (!['available', 'playing', 'offline'].includes(String(body.state))) throw new AppApiError(400, "Estado de presença inválido.");
  await ensureSocialProfile(db, actor);
  const { error } = await db.rpc("social_heartbeat", { p_actor: actor, p_device: device, p_state: body.state });
  checkDatabaseError(error);
  return { ok: true };
}

export async function setPresenceMode(db: SupabaseClient, actor: string, mode: unknown) {
  if (!['available', 'away', 'invisible'].includes(String(mode))) throw new AppApiError(400, "Estado de presença inválido.");
  await ensureSocialProfile(db, actor);
  const { error } = await db.from("social_profiles").update({ presence_mode: mode }).eq("user_id", actor);
  checkDatabaseError(error);
  return { ok: true };
}

export async function createInvitation(db: SupabaseClient, actor: string, body: Record<string, unknown>) {
  const code = validateFriendCode(body.targetCode);
  const requestId = validateUuid(body.requestId);
  const game = validateInvitationGame(body.game);
  await ensureSocialProfile(db, actor);
  const target = await profileByCode(db, code);
  const { data, error } = await db.rpc("social_create_invitation", { p_actor: actor, p_target: target.user_id, p_request: requestId, p_game: game });
  checkDatabaseError(error);
  return { invitationId: data as string };
}

export async function respondInvitation(db: SupabaseClient, actor: string, body: Record<string, unknown>) {
  const invitation = validateUuid(body.invitationId);
  if (!['accept','decline','cancel'].includes(String(body.response))) throw new AppApiError(400, "Resposta ao convite inválida.");
  const { data, error } = await db.rpc("social_respond_invitation", { p_actor: actor, p_invitation: invitation, p_action: body.response });
  checkDatabaseError(error);
  return data;
}

export async function closeRoom(db: SupabaseClient, actor: string, body: Record<string, unknown>) {
  const { error } = await db.rpc("social_close_room", { p_actor: actor, p_room: validateUuid(body.roomId) });
  checkDatabaseError(error);
  return { ok: true };
}
