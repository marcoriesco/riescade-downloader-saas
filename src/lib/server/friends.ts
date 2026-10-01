import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "./app-errors";

export const FRIEND_ACTIONS = ["request", "accept", "decline", "cancel", "remove", "block", "unblock"] as const;
export type FriendAction = (typeof FRIEND_ACTIONS)[number];
export type SocialProfile = { user_id: string; friend_code: string; display_name: string };
const PROFILE_FIELDS = "user_id,friend_code,display_name";

export function assertFriendsEnabled() {
  if (process.env.RIESCADE_FRIENDS_ENABLED !== "true") {
    throw new AppApiError(404, "Sistema de amigos ainda não habilitado.");
  }
}

export function validateFriendCode(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{16}$/i.test(value.trim())) {
    throw new AppApiError(400, "Informe um código de amizade válido de 16 caracteres.");
  }
  return value.trim().toUpperCase();
}

export function validateDisplayName(value: unknown): string {
  if (typeof value !== "string" || /[\x00-\x1f\x7f]/.test(value)) {
    throw new AppApiError(400, "Nome de exibição inválido.");
  }
  const name = value.trim();
  if ([...name].length < 1 || [...name].length > 40) {
    throw new AppApiError(400, "O nome deve conter entre 1 e 40 caracteres.");
  }
  return name;
}

export function validateFriendAction(value: unknown): FriendAction {
  if (typeof value !== "string" || !FRIEND_ACTIONS.includes(value as FriendAction)) {
    throw new AppApiError(400, "Ação de amizade inválida.");
  }
  return value as FriendAction;
}

export function checkDatabaseError(error: { message: string } | null) {
  if (!error) return;
  const messages: Record<string, [number, string]> = {
    SOCIAL_INVALID_TARGET: [400, "Você não pode adicionar ou bloquear a própria conta."],
    SOCIAL_INVALID_ACTION: [400, "Ação de amizade inválida."],
    SOCIAL_UNAVAILABLE: [404, "Jogador indisponível."],
    SOCIAL_INCOMING_REQUEST: [409, "Você já recebeu uma solicitação deste jogador. Aceite ou recuse a solicitação."],
    SOCIAL_FORBIDDEN: [403, "Esta ação não está disponível para você."],
    SOCIAL_RATE_LIMIT: [429, "Limite de solicitações atingido. Tente novamente mais tarde."],
    SOCIAL_INVALID_PRESENCE: [400, "Estado de presença inválido."],
    SOCIAL_DEVICE_LIMIT: [409, "Limite de dispositivos ativos atingido."],
    SOCIAL_INVALID_REQUEST: [409, "Este convite já foi enviado com outros dados."],
    SOCIAL_ROOM_BUSY: [409, "Um dos jogadores já está preparando uma partida."],
    SOCIAL_INVITATION_PENDING: [409, "Já existe um convite pendente entre vocês."],
    SOCIAL_INCOMPATIBLE: [409, "Jogo, core ou RetroArch diferentes. Use NES/FCEUmm com os mesmos arquivos."],
  };
  const mapped = messages[error.message];
  if (mapped) throw new AppApiError(...mapped);
  throw new Error("Falha ao acessar dados sociais.");
}

export async function ensureSocialProfile(db: SupabaseClient, actorId: string): Promise<SocialProfile> {
  // Ignore duplicates: signing in on another device must never reset the name/code.
  const { error: insertError } = await db.from("social_profiles").upsert(
    { user_id: actorId }, { onConflict: "user_id", ignoreDuplicates: true }
  );
  checkDatabaseError(insertError);
  const { data, error } = await db.from("social_profiles").select(PROFILE_FIELDS).eq("user_id", actorId).single();
  checkDatabaseError(error);
  if (!data) throw new Error("Perfil social não encontrado.");
  return data as SocialProfile;
}

export async function profileByCode(db: SupabaseClient, code: string): Promise<SocialProfile> {
  const { data, error } = await db.from("social_profiles").select(PROFILE_FIELDS).eq("friend_code", code).maybeSingle();
  checkDatabaseError(error);
  if (!data) throw new AppApiError(404, "Jogador indisponível.");
  return data as SocialProfile;
}

export async function findFriendProfile(db: SupabaseClient, actorId: string, code: string) {
  const target = await profileByCode(db, code);
  const { data, error } = await db.from("social_blocks").select("blocker_id").or(
    `and(blocker_id.eq.${actorId},blocked_id.eq.${target.user_id}),and(blocker_id.eq.${target.user_id},blocked_id.eq.${actorId})`
  ).limit(1);
  checkDatabaseError(error);
  if (data?.length) throw new AppApiError(404, "Jogador indisponível.");
  return target;
}

export async function applyFriendAction(db: SupabaseClient, actorId: string, action: FriendAction, code: string) {
  await ensureSocialProfile(db, actorId);
  const target = await profileByCode(db, code);
  const { data, error } = await db.rpc("social_apply_action", {
    p_actor: actorId, p_target: target.user_id, p_action: action,
  });
  checkDatabaseError(error);
  return { status: data as string };
}

export async function updateSocialProfile(db: SupabaseClient, actorId: string, displayName: string) {
  await ensureSocialProfile(db, actorId);
  const { data, error } = await db.from("social_profiles").update({ display_name: displayName })
    .eq("user_id", actorId).select(PROFILE_FIELDS).single();
  checkDatabaseError(error);
  return data as SocialProfile;
}

export async function getFriendsPage(db: SupabaseClient, actorId: string, page: number) {
  const profile = await ensureSocialProfile(db, actorId);
  const { data: relations, error } = await db.from("social_relationships")
    .select("id,requester_id,recipient_id,status,created_at")
    .or(`requester_id.eq.${actorId},recipient_id.eq.${actorId}`)
    .order("created_at", { ascending: false }).order("id")
    .range(page * 100, page * 100 + 100);
  checkDatabaseError(error);
  const { data: blocks, error: blockError } = await db.from("social_blocks")
    .select("blocked_id").eq("blocker_id", actorId).order("created_at").range(page * 100, page * 100 + 100);
  checkDatabaseError(blockError);
  const visible = (relations || []).slice(0, 100);
  const visibleBlocks = (blocks || []).slice(0, 100);
  const ids = [...new Set([
    ...visible.map(row => row.requester_id === actorId ? row.recipient_id : row.requester_id),
    ...visibleBlocks.map(row => row.blocked_id),
  ])];
  let profiles: SocialProfile[] = [];
  if (ids.length) {
    const result = await db.from("social_profiles").select(PROFILE_FIELDS).in("user_id", ids);
    checkDatabaseError(result.error);
    profiles = (result.data || []) as SocialProfile[];
  }
  const byId = new Map(profiles.map(person => [person.user_id, person]));
  return {
    profile,
    relationships: visible.map(row => ({
      id: row.id, status: row.status, direction: row.requester_id === actorId ? "outgoing" : "incoming",
      profile: byId.get(row.requester_id === actorId ? row.recipient_id : row.requester_id),
    })),
    blocked: visibleBlocks.map(row => byId.get(row.blocked_id)).filter(Boolean),
    hasMore: (relations?.length || 0) > 100 || (blocks?.length || 0) > 100,
    page,
  };
}
