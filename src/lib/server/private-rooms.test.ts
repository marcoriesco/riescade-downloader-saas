import { afterEach, beforeEach, expect, it } from 'vitest';
import { signRelayTicket,verifyRelayTicket,roomStep } from './private-rooms';
import type { SupabaseClient } from '@supabase/supabase-js';
const original=process.env.RIESCADE_RELAY_SIGNING_KEY;
const claims={room:'11111111-1111-1111-1111-111111111111',actor:'22222222-2222-2222-2222-222222222222',device:'33333333-3333-3333-3333-333333333333',role:'host' as const,exp:Math.floor(Date.now()/1000)+120,aud:'riescade-relay-v1' as const};
beforeEach(()=>{process.env.RIESCADE_RELAY_SIGNING_KEY='test-secret-key-for-local-tests-only';});
afterEach(()=>{if(original===undefined)delete process.env.RIESCADE_RELAY_SIGNING_KEY;else process.env.RIESCADE_RELAY_SIGNING_KEY=original;});
it('binds signed tickets to room, device, actor, role and expiration',()=>{
  const ticket=signRelayTicket(claims);expect(verifyRelayTicket(ticket)).toEqual(claims);
  expect(()=>verifyRelayTicket(ticket+'x')).toThrow();
  expect(()=>verifyRelayTicket(signRelayTicket({...claims,exp:0}))).toThrow();
  expect(verifyRelayTicket(signRelayTicket({...claims,exp:0}),true).role).toBe('host');
});
it('rejects missing relay configuration before consuming a launch claim',async()=>{
  const oldHost=process.env.RIESCADE_RELAY_HOST;delete process.env.RIESCADE_RELAY_HOST;
  try {await expect(roomStep({rpc:()=>{throw new Error('must not mutate');}} as unknown as SupabaseClient,claims.actor,{roomId:claims.room,deviceId:claims.device,step:'claim'})).rejects.toThrow('Relay ainda não configurado');}
  finally {if(oldHost!==undefined)process.env.RIESCADE_RELAY_HOST=oldHost;}
});
