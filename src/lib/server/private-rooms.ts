import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppApiError } from './app-errors';
import { validateUuid } from './social-sessions';
import { checkDatabaseError } from './friends';
export type RelayClaims = { room: string; actor: string; device: string; role: 'host'|'guest'; exp: number; aud: 'riescade-relay-v1' };
function secret() {
  const key = process.env.RIESCADE_RELAY_SIGNING_KEY;
  if (!key || key.length<32) throw new AppApiError(503,'Relay ainda não configurado.');
  return key;
}
export function signRelayTicket(claims: RelayClaims) {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${createHmac('sha256',secret()).update(payload).digest('base64url')}`;
}
export function verifyRelayTicket(ticket: string, active = false): RelayClaims {
  if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(ticket)) throw new AppApiError(401,'Credencial de relay inválida.');
  const [payload, signature, extra] = ticket.split('.');
  if (!payload || !signature || extra || ticket.length>2048) throw new AppApiError(401,'Credencial de relay inválida.');
  const expected = createHmac('sha256',secret()).update(payload).digest();
  const received = Buffer.from(signature,'base64url');
  if (received.length!==expected.length || !timingSafeEqual(expected,received)) throw new AppApiError(401,'Credencial de relay inválida.');
  let claims: RelayClaims;
  try { claims=JSON.parse(Buffer.from(payload,'base64url').toString()); } catch { throw new AppApiError(401,'Credencial de relay inválida.'); }
  if (claims.aud!=='riescade-relay-v1' || !['host','guest'].includes(claims.role) || !Number.isFinite(claims.exp) || (!active && claims.exp<Date.now()/1000)) throw new AppApiError(401,'Credencial de relay expirada.');
  validateUuid(claims.room);validateUuid(claims.actor);validateUuid(claims.device);
  return claims;
}
export async function roomStep(db: SupabaseClient, actor: string, body: Record<string,unknown>) {
  const room=validateUuid(body.roomId), device=validateUuid(body.deviceId);
  if (!['get','ready','claim','session','connected','end','fail'].includes(String(body.step))) throw new AppApiError(400,'Ação de sala inválida.');
  if(body.step==='claim') {
    secret();
    const host=process.env.RIESCADE_RELAY_HOST,port=Number(process.env.RIESCADE_RELAY_PORT);
    if(!host || !/^[a-z0-9.-]+$/i.test(host) || !Number.isInteger(port) || port<1 || port>65535) throw new AppApiError(503,'Relay ainda não configurado.');
  }
  const {data,error}=await db.rpc('social_room_step',{p_actor:actor,p_room:room,p_device:device,p_action:body.step,p_data:body.data || {}});
  checkDatabaseError(error);
  if (!data) throw new AppApiError(404,'Sala indisponível.');
  if (body.step==='claim' && data.launch) {
    const host=process.env.RIESCADE_RELAY_HOST, port=Number(process.env.RIESCADE_RELAY_PORT);
    if (!host || !/^[a-z0-9.-]+$/i.test(host) || !Number.isInteger(port) || port<1 || port>65535) throw new AppApiError(503,'Relay ainda não configurado.');
    const ticket=signRelayTicket({room,actor,device,role:data.role,exp:Math.floor(Date.now()/1000)+120,aud:'riescade-relay-v1'});
    return {...data,transport:{host,port,ticket}};
  }
  return data;
}
export async function authorizeRelay(db: SupabaseClient, ticket: string, active: boolean) {
  const claims=verifyRelayTicket(ticket,active);
  const {data:room,error}=await db.from('social_rooms').select('host_id,guest_id,state,expires_at').eq('id',claims.room).maybeSingle();
  checkDatabaseError(error);
  const {data:run,error:runError}=await db.from('social_room_runtime').select('*').eq('room_id',claims.room).maybeSingle();
  checkDatabaseError(runError);
  const host=claims.role==='host';
  if (!room || !run || room.state!=='validating' || Date.parse(room.expires_at)<Date.now()
    || !['preparing','connecting','playing'].includes(run.phase)
    || (host ? room.host_id!==claims.actor || run.host_device!==claims.device : room.guest_id!==claims.actor || run.guest_device!==claims.device)) throw new AppApiError(403,'Sala encerrada.');
  return claims;
}
