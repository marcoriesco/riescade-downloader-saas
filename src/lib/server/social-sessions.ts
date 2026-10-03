import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "./app-errors";
import { checkDatabaseError, ensureSocialProfile, profileByCode, validateFriendCode } from "./friends";

export interface InvitationGame {
  title: string; system: string; core: string;
  content_hash: string; core_hash: string; emulator_hash: string; asset_id?: string; hosted_session_id?: string;
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
    content_hash: hash("content_hash"), core_hash: hash("core_hash"), emulator_hash: hash("emulator_hash"),
    ...(typeof game.asset_id === 'string' && /^[a-f0-9]{64}$/i.test(game.asset_id) ? {asset_id:game.asset_id.toLowerCase()} : {}),
    ...(game.hosted_session_id !== undefined ? {hosted_session_id:validateUuid(game.hosted_session_id)} : {}) };
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
  const { error } = await db.rpc("social_set_invitation_preferences", {p_actor:actor,p_mode:mode});
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

export async function dismissInvitation(db: SupabaseClient, actor: string, body: Record<string, unknown>) {
  const { error } = await db.rpc("social_dismiss_invitation", { p_actor: actor, p_invitation: validateUuid(body.invitationId) });
  checkDatabaseError(error);
  return { ok: true };
}

export async function closeRoom(db: SupabaseClient, actor: string, body: Record<string, unknown>) {
  const { error } = await db.rpc("social_close_room", { p_actor: actor, p_room: validateUuid(body.roomId) });
  checkDatabaseError(error);
  return { ok: true };
}

export async function invitationPreferences(db: SupabaseClient, actor: string, body: Record<string,unknown>) {
  if(typeof body.receive !== 'boolean') throw new AppApiError(400,'Preferência inválida.');
  await ensureSocialProfile(db,actor);
  const {error}=await db.rpc('social_set_invitation_preferences',{p_actor:actor,p_receive:body.receive});
  checkDatabaseError(error);return {ok:true};
}
export async function invitationProgress(db: SupabaseClient, actor: string, body: Record<string,unknown>) {
  if(!['checking','needs_download','missing_game','downloading','installing','preparing','connecting','playing','failed','cancelled'].includes(String(body.phase))) throw new AppApiError(400,'Etapa inválida.');
  if(body.message !== undefined && body.message !== null && (typeof body.message !== 'string' || body.message.length>400 || /[\x00-\x1f\x7f]/.test(body.message))) throw new AppApiError(400,'Mensagem inválida.');
  const {error}=await db.rpc('social_set_invitation_progress',{p_actor:actor,p_invitation:validateUuid(body.invitationId),p_phase:body.phase,p_message:body.message || null});
  checkDatabaseError(error);return {ok:true};
}
export async function hostedSession(db: SupabaseClient,actor:string,body:Record<string,unknown>) {
  const id=validateUuid(body.sessionId);
  const game=body.close===true ? null : validateInvitationGame(body.game);
  const raw=body.connection as Record<string,unknown>|undefined;
  if(body.close!==true && (!raw || typeof raw.host!=='string' || !/^[A-Za-z0-9.-]{1,255}$/.test(raw.host) || !Number.isInteger(raw.port) || Number(raw.port)<1 || Number(raw.port)>65535 || typeof raw.session!=='string' || !/^[A-Za-z0-9+/]{16}$/.test(raw.session) || (raw.password!==undefined && (typeof raw.password!=='string' || raw.password.length>64 || /[\x00-\x1f\x7f]/.test(raw.password))))) throw new AppApiError(400,'Sala inválida.');
  const connection=body.close===true ? null : {host:raw!.host,port:raw!.port,session:raw!.session,...(raw!.password ? {password:raw!.password}: {})};
  const {data,error}=await db.rpc('social_publish_hosted_session',{p_actor:actor,p_id:id,p_game:game,p_connection:connection,p_close:body.close===true});
  checkDatabaseError(error);return {sessionId:data};
}
export async function hostedConnection(db:SupabaseClient,actor:string,body:Record<string,unknown>) {
  const {data,error}=await db.rpc('social_hosted_invitation_connection',{p_actor:actor,p_invitation:validateUuid(body.invitationId)});
  checkDatabaseError(error);return data;
}
