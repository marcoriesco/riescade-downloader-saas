import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { findFriendProfile, safeAvatarUrl, updateSocialProfile, resetSocialName } from './friends';
function fixture(blocked=false) {
  const lookup=vi.fn().mockResolvedValue({data:{user:{email:'private@example.com',user_metadata:{avatar_url:'https://example.com/avatar.png',full_name:'Private'}}},error:null});
  const profile={user_id:'target',friend_code:'0123456789ABCDEF',display_name:'Amigo'};
  const query={select:()=>query,eq:()=>query,or:()=>query,maybeSingle:async()=>({data:profile,error:null}),limit:async()=>({data:blocked?[{blocker_id:'actor'}]:[],error:null})};
  const db={from:()=>query,auth:{admin:{getUserById:lookup}}} as unknown as SupabaseClient;
  return {db,lookup,profile};
}
describe('friend avatar enrichment',()=>{
  it('returns only the image URL and reuses bounded cache',async()=>{const {db,lookup,profile}=fixture();expect(await findFriendProfile(db,'actor',profile.friend_code)).toEqual({...profile,avatar_url:'https://example.com/avatar.png'});await findFriendProfile(db,'actor',profile.friend_code);expect(lookup).toHaveBeenCalledTimes(1)});
  it('checks blocks before accessing Auth metadata',async()=>{const {db,lookup,profile}=fixture(true);await expect(findFriendProfile(db,'actor',profile.friend_code)).rejects.toThrow('Jogador indisponível');expect(lookup).not.toHaveBeenCalled()});
  it('keeps the profile available when avatar lookup fails',async()=>{const {db,lookup,profile}=fixture();lookup.mockRejectedValue(new Error('Auth unavailable'));expect(await findFriendProfile(db,'actor',profile.friend_code)).toEqual({...profile,avatar_url:null})});
  it.each(['javascript:alert(1)','data:image/png;base64,AA','file:///private/avatar.png','http://example.com/a','https://user:secret@example.com/a'])('rejects unsafe avatar %s',value=>expect(safeAvatarUrl(value)).toBeNull());
});


describe('online identity updates',()=>{
 function editable(){
  const profile={user_id:'actor',friend_code:'0123456789ABCDEF',display_name:'My nick',name_source:'custom',avatar_url:null as string|null};
  const lookup=vi.fn().mockResolvedValue({data:{user:{user_metadata:{full_name:'Google Fullname',picture:'https://example.com/google.png'}}},error:null});
  const query={upsert:async()=>({error:null}),select:()=>query,eq:()=>query,update:(changes:object)=>{Object.assign(profile,changes);return query;},single:async()=>({data:{...profile},error:null}),then:(resolve:(value:{error:null})=>unknown)=>Promise.resolve(resolve({error:null}))};
  const db={from:()=>query,auth:{admin:{getUserById:lookup}}} as unknown as SupabaseClient;
  return {profile,db};
 }
 it('preserves the Google photo when saving a nickname',async()=>{
  const {db}=editable();const profile=await updateSocialProfile(db,'actor','New nick');
  expect(profile.display_name).toBe('New nick');expect(profile.avatar_url).toBe('https://example.com/google.png');
 });
 it('preserves a custom avatar when changing the nickname',async()=>{
  const {db,profile}=editable();profile.avatar_url='https://example.com/custom.webp';
  expect((await updateSocialProfile(db,'actor','New nick')).avatar_url).toBe(profile.avatar_url);
 });
 it('restores and persists the Google fullname without replacing a custom photo',async()=>{
  const {db,profile}=editable();profile.avatar_url='https://example.com/custom.webp';
  const result=await resetSocialName(db,'actor');
  expect(result.display_name).toBe('Google Fullname');expect(result.avatar_url).toBe(profile.avatar_url);expect(profile.name_source).toBe('google');expect(profile.display_name).toBe('Google Fullname');
 });
});
