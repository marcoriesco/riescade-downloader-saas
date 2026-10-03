import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const C = '00000000-0000-4000-8000-000000000003';
const D = '00000000-0000-4000-8000-000000000004';
const game = { title: 'Test NES', system: 'nes', core: 'fceumm', content_hash: 'a'.repeat(64), core_hash: 'b'.repeat(64), emulator_hash: 'c'.repeat(64) };
let db: PGlite;
async function scalar<T>(sql: string, parameters: unknown[]): Promise<T> {
  const { rows } = await db.query<{ value: T }>(`select ${sql} as value`, parameters);
  return rows[0].value;
}
const invite = (actor = A, target = B, nonce = randomUUID(), descriptor = game) => scalar<string>('public.social_create_invitation($1,$2,$3,$4)', [actor,target,nonce,descriptor]);
const respond = (actor: string, id: string, action: string) => scalar<{ status: string; room_id: string | null }>('public.social_respond_invitation($1,$2,$3)', [actor,id,action]);
const snapshot = (actor: string) => scalar<{ presence_mode: string; presence: Array<{user_id: string;state: string}>; invitations: Array<{id: string}>; rooms: Array<{id: string}> }>('public.social_session_snapshot($1)', [actor]);
const heartbeat = (actor: string, device = D, state = 'available') => scalar('public.social_heartbeat($1,$2,$3)', [actor,device,state]);
beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values('${A}'),('${B}'),('${C}');`);
  for (const filename of ['20261001160000_add_riescade_friends.sql','20261001165952_add_social_presence_and_invitations.sql','20261001175531_add_private_room_runtime.sql','20261002221636_generalize_private_retroarch_rooms.sql','20261002231910_improve_game_invitations.sql']) {
    await db.exec(readFileSync(resolve('supabase/migrations',filename),'utf8'));
  }
},30000);
beforeEach(async () => {
  await db.exec(`reset role; truncate public.social_profiles cascade;
    insert into public.social_profiles(user_id) values('${A}'),('${B}'),('${C}');
    set role service_role;
    select public.social_apply_action('${A}','${B}','request');
    select public.social_apply_action('${B}','${A}','accept');
    select public.social_heartbeat('${A}','${A}','available');
    select public.social_heartbeat('${B}','${B}','available');`);
});
afterAll(async () => { if(db) await db.close(); });

describe('native invitation coordination in local Postgres', () => {
  const step=(actor:string,room:string,device:string,action:string,data:object={})=>scalar<{phase:string;launch:boolean;session?:string;role:string}>('public.social_room_step($1,$2,$3,$4,$5)',[actor,room,device,action,data]);
  const manifest={...game,profile:'nes-fceumm-v1'};
  const createRoom=async()=>{const id=await invite();return (await respond(B,id,'accept')).room_id!};
  it('accepts generalized RetroArch manifests and rejects a different system or core', async () => {
    const descriptor={...game,title:'SNES test',system:'snes',core:'snes9x'};
    const id=await invite(A,B,randomUUID(),descriptor);
    const room=(await respond(B,id,'accept')).room_id!;
    await expect(step(A,room,A,'ready',{...descriptor,profile:'retroarch-v1',core:'fceumm'})).rejects.toThrow('SOCIAL_INCOMPATIBLE');
    await expect(step(A,room,A,'ready',{...descriptor,profile:'retroarch-v1',system:'nes'})).rejects.toThrow('SOCIAL_INCOMPATIBLE');
    await step(A,room,A,'ready',{...descriptor,profile:'retroarch-v1'});
    expect((await step(B,room,B,'ready',{...descriptor,profile:'retroarch-v1'})).phase).toBe('waiting');
  });
  it('runs readiness, claims, session and playing only in authorized order',async()=>{
    const room=await createRoom();
    await expect(step(A,room,A,'claim')).rejects.toThrow('SOCIAL_FORBIDDEN');
    await step(A,room,A,'ready',manifest);
    expect((await step(B,room,B,'ready',manifest)).phase).toBe('waiting');
    expect((await step(B,room,B,'claim')).launch).toBe(false);
    expect((await step(A,room,A,'claim')).launch).toBe(true);
    expect((await step(A,room,A,'claim')).launch).toBe(false);
    await expect(step(B,room,B,'session',{session:'a'.repeat(16)})).rejects.toThrow('SOCIAL_FORBIDDEN');
    await step(A,room,A,'session',{session:'a'.repeat(16)});
    expect((await step(A,room,A,'get')).session).toBeNull();
    const guest=await step(B,room,B,'claim');expect(guest.launch).toBe(true);expect(guest.session).toBe('a'.repeat(16));
    expect((await step(B,room,B,'claim')).launch).toBe(false);
    expect((await step(A,room,A,'connected')).phase).toBe('connecting');
    expect((await step(B,room,B,'connected')).phase).toBe('playing');
    expect((await step(A,room,A,'end')).phase).toBe('ended');
    expect((await step(B,room,B,'claim')).phase).toBe('ended');
  });
  it('accepts any profile and rejects content differences and wrong devices',async()=>{
    const room=await createRoom();
    await step(A,room,A,'ready',game);
    await expect(step(A,room,A,'ready',{...manifest,content_hash:'d'.repeat(64)})).rejects.toThrow('SOCIAL_INCOMPATIBLE');
    await step(A,room,A,'ready',manifest);
    await expect(step(A,room,D,'claim')).rejects.toThrow('SOCIAL_DEVICE_LIMIT');
    await expect(step(C,room,C,'get')).rejects.toThrow('SOCIAL_UNAVAILABLE');
  });
  it('block and disconnection invalidate active runtime',async()=>{
    const room=await createRoom();await step(A,room,A,'ready',manifest);await step(B,room,B,'ready',manifest);await step(A,room,A,'claim');
    await db.exec(`update public.social_room_runtime set guest_seen=now()-interval '2 minutes'`);
    expect((await step(A,room,A,'get')).phase).toBe('failed');
    const room2=await createRoom();await step(A,room2,A,'ready',manifest);
    await scalar('public.social_apply_action($1,$2,$3)',[A,B,'block']);
    expect((await step(A,room2,A,'get')).phase).toBe('ended');
  });
  it.each(['anon','authenticated'])('denies %s room runtime reads and actor spoofing',async role=>{
    const room=await createRoom();await db.exec(`set role ${role}`);
    await expect(step(A,room,A,'ready',manifest)).rejects.toThrow(/permission denied/);
    await expect(db.query('select * from public.social_room_runtime')).rejects.toThrow(/permission denied/);
  });
  it('requires accepted friendship and prevents self invites', async () => {
    await expect(invite(A,C)).rejects.toThrow('SOCIAL_UNAVAILABLE');
    await expect(invite(A,A)).rejects.toThrow('SOCIAL_INVALID_TARGET');
    const id = await invite();
    expect((await snapshot(A)).invitations[0].id).toBe(id);
    expect((await snapshot(B)).invitations[0].id).toBe(id);
    expect((await snapshot(C)).invitations).toEqual([]);
  });
  it('idempotency cannot change recipient or content', async () => {
    const nonce = randomUUID(); const id = await invite(A,B,nonce);
    expect(await invite(A,B,nonce)).toBe(id);
    await expect(invite(A,B,nonce,{...game,title:'Other'})).rejects.toThrow('SOCIAL_INVALID_REQUEST');
    await expect(invite(B,A)).rejects.toThrow('SOCIAL_INVITATION_PENDING');
  });
  it('only recipient accepts and creates exactly one room', async () => {
    const id = await invite();
    await expect(respond(A,id,'accept')).rejects.toThrow('SOCIAL_FORBIDDEN');
    await expect(respond(C,id,'accept')).rejects.toThrow('SOCIAL_UNAVAILABLE');
    const accepted = await respond(B,id,'accept');
    expect(accepted.status).toBe('accepted');
    expect(await respond(B,id,'accept')).toEqual(accepted);
    expect((await snapshot(B)).rooms).toHaveLength(1);
    expect((await snapshot(C)).rooms).toEqual([]);
    expect((await db.query('select state from public.social_rooms')).rows).toEqual([{state:'validating'}]);
  });
  it('expired invitations cannot create rooms', async () => {
    const id = await invite();
    await db.query("update public.social_invitations set expires_at=now()-interval '1 second' where id=$1",[id]);
    expect(await respond(B,id,'accept')).toEqual({status:'expired',room_id:null});
    expect((await snapshot(B)).rooms).toEqual([]);
    expect((await snapshot(B)).invitations).toEqual([]);
  });
  it('only sender cancels and only recipient declines', async () => {
    const id = await invite();
    await expect(respond(B,id,'cancel')).rejects.toThrow('SOCIAL_FORBIDDEN');
    await expect(respond(A,id,'decline')).rejects.toThrow('SOCIAL_FORBIDDEN');
    expect((await respond(A,id,'cancel')).status).toBe('cancelled');
    expect((await respond(B,id,'accept')).status).toBe('cancelled');
  });
  it('blocking cancels pending invitations and accepted rooms atomically', async () => {
    const id = await invite(); const accepted = await respond(B,id,'accept');
    await scalar('public.social_apply_action($1,$2,$3)',[A,B,'block']);
    expect((await respond(B,id,'accept')).status).toBe('cancelled');
    expect((await snapshot(A)).rooms).toEqual([]);
    expect((await db.query('select state from public.social_rooms where id=$1',[accepted.room_id])).rows).toEqual([{state:'cancelled'}]);
    await expect(invite()).rejects.toThrow('SOCIAL_UNAVAILABLE');
  });
  it('leaving is participant-only and old accepted invitations do not reopen rooms', async () => {
    const id = await invite(); const accepted = await respond(B,id,'accept');
    await expect(scalar('public.social_close_room($1,$2)',[C,accepted.room_id])).rejects.toThrow('SOCIAL_UNAVAILABLE');
    await scalar('public.social_close_room($1,$2)',[B,accepted.room_id]);
    expect((await respond(B,id,'accept')).room_id).toBeNull();
    expect((await snapshot(A)).rooms).toEqual([]);
  });
  it('persistent invitation quota survives cancellation', async () => {
    for(let index=0;index<20;index++) { const id=await invite(); await respond(A,id,'cancel'); }
    await expect(invite()).rejects.toThrow('SOCIAL_RATE_LIMIT');
  });
  it('does not allow overlapping preparation rooms', async () => {
    const id=await invite(); await respond(B,id,'accept');
    await scalar('public.social_apply_action($1,$2,$3)',[A,C,'request']);
    await scalar('public.social_apply_action($1,$2,$3)',[C,A,'accept']);
    await heartbeat(C);
    await expect(invite(A,C)).rejects.toThrow('SOCIAL_ROOM_BUSY');
  });
  it('presence expires and another active device keeps the account available', async () => {
    await heartbeat(B);
    expect((await snapshot(A)).presence).toEqual([expect.objectContaining({user_id:B,state:'available'})]);
    await db.exec("update public.social_presence set last_seen_at=now()-interval '76 seconds'");
    expect((await snapshot(A)).presence[0].state).toBe('offline');
    await heartbeat(B,randomUUID(),'playing');
    expect((await snapshot(A)).presence[0].state).toBe('playing');
    expect((await snapshot(C)).presence).toEqual([]);
  });
  it('invisible mode hides all devices and heartbeat cannot override it', async () => {
    await heartbeat(B);
    await db.query("update public.social_profiles set presence_mode='invisible' where user_id=$1",[B]);
    await heartbeat(B,randomUUID(),'playing');
    expect((await snapshot(A)).presence).toEqual([expect.objectContaining({user_id:B,state:'offline'})]);
    await scalar('public.social_apply_action($1,$2,$3)',[A,B,'block']);
    expect((await snapshot(A)).presence).toEqual([]);
  });
  it.each(['anon','authenticated'])('denies %s snapshots, actor spoofing and direct rows', async role => {
    await db.exec(`set role ${role}`);
    await expect(snapshot(A)).rejects.toThrow('permission denied');
    await expect(invite()).rejects.toThrow('permission denied');
    await expect(db.query('select * from public.social_invitations')).rejects.toThrow('permission denied');
    await expect(db.query('select * from public.social_rooms')).rejects.toThrow('permission denied');
    await expect(db.query('select * from public.social_presence')).rejects.toThrow('permission denied');
  });
  it('schema rejects null fingerprints', async () => {
    await expect(invite(A,B,randomUUID(),{...game,content_hash:null} as unknown as typeof game)).rejects.toThrow('check constraint');
  });
});

it('invitation preferences cancel pending delivery and survive later heartbeats',async()=>{
 const id=await invite();
 await scalar('public.social_set_invitation_preferences($1,$2,$3)',[B,false,null]);
 await expect(invite()).rejects.toThrow('SOCIAL_UNAVAILABLE');
 expect((await respond(B,id,'accept')).status).toBe('cancelled');
 await heartbeat(B);
 expect((await snapshot(A)).presence[0]).toMatchObject({can_invite:false});
 await scalar('public.social_set_invitation_preferences($1,$2,$3)',[B,true,'invisible']);
 await expect(invite()).rejects.toThrow('SOCIAL_UNAVAILABLE');
});
it('records invitation outcomes without delivering completed invitations',async()=>{
 const id=await invite();await respond(B,id,'decline');
 const result=await scalar<any>('public.social_session_snapshot($1)',[A]);
 expect(result.invitations).toEqual([]);
 expect(result.invitation_history.find((i:any)=>i.id===id).status).toBe('declined');
});

it('existing host invitations reuse the host without creating a second private room',async()=>{
 const session=randomUUID();const connection={host:'relay.example',port:55435,session:'a'.repeat(16),password:'secret'};
 await scalar('public.social_publish_hosted_session($1,$2,$3,$4,$5)',[A,session,game,connection,false]);
 const id=await invite(A,B,randomUUID(),{...game,hosted_session_id:session} as typeof game);
 expect(await respond(B,id,'accept')).toEqual({status:'accepted',room_id:null});
 expect((await db.query('select * from public.social_rooms')).rows).toHaveLength(0);
 const guest=await scalar<any>('public.social_hosted_invitation_connection($1,$2)',[B,id]);
 expect(guest).toEqual(connection);
 await expect(scalar('public.social_hosted_invitation_connection($1,$2)',[C,id])).rejects.toThrow('SOCIAL_UNAVAILABLE');
 const result=await scalar<any>('public.social_session_snapshot($1)',[B]);
 expect(JSON.stringify(result)).not.toContain('secret');
 await scalar('public.social_publish_hosted_session($1,$2,$3,$4,$5)',[A,session,null,null,true]);
 await expect(scalar('public.social_hosted_invitation_connection($1,$2)',[B,id])).rejects.toThrow('SOCIAL_UNAVAILABLE');
 await expect(scalar('public.social_publish_hosted_session($1,$2,$3,$4,$5)',[A,session,game,connection,false])).rejects.toThrow('SOCIAL_UNAVAILABLE');
 expect((await scalar<any>('public.social_session_snapshot($1)',[B])).invitation_history[0].phase).toBe('ended');
});
it('an existing-session invite cannot impersonate another host or change its game',async()=>{
 const session=randomUUID();await scalar('public.social_publish_hosted_session($1,$2,$3,$4,$5)',[A,session,game,{host:'relay.example',port:55435,session:'a'.repeat(16)},false]);
 await expect(invite(B,A,randomUUID(),{...game,hosted_session_id:session} as typeof game)).rejects.toThrow('SOCIAL_UNAVAILABLE');
 await expect(invite(A,B,randomUUID(),{...game,title:'Other',hosted_session_id:session} as typeof game)).rejects.toThrow('SOCIAL_UNAVAILABLE');
});
it('active preparation renews the room while cancellation ends it',async()=>{
 const id=await invite();const accepted=await respond(B,id,'accept');
 await db.query("update public.social_rooms set expires_at=now()+interval '1 second' where id=$1",[accepted.room_id]);
 await scalar('public.social_set_invitation_progress($1,$2,$3)',[B,id,'downloading']);
 expect(await scalar<boolean>("(select expires_at>now()+interval '100 seconds' from public.social_rooms where id=$1)",[accepted.room_id])).toBe(true);
 await scalar('public.social_set_invitation_progress($1,$2,$3)',[B,id,'cancelled']);
 expect((await snapshot(B)).rooms).toHaveLength(0);
 await expect(scalar('public.social_set_invitation_progress($1,$2,$3)',[B,id,'preparing'])).rejects.toThrow('SOCIAL_UNAVAILABLE');
});

it('downloads renew preparation beyond the old forty-five-minute limit',async()=>{
 const id=await invite();const accepted=await respond(B,id,'accept');
 await db.query("update public.social_invitations set created_at=now()-interval '46 minutes' where id=$1",[id]);
 await db.query("update public.social_rooms set created_at=now()-interval '46 minutes',expires_at=now()+interval '1 second' where id=$1",[accepted.room_id]);
 await scalar('public.social_set_invitation_progress($1,$2,$3)',[B,id,'downloading']);
 expect(await scalar<boolean>("(select expires_at>now()+interval '100 seconds' from public.social_rooms where id=$1)",[accepted.room_id])).toBe(true);
});
