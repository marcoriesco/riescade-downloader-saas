import {beforeEach,afterEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({authorize:vi.fn()}));
vi.mock('@/lib/server/private-rooms',()=>({authorizeRelay:mocks.authorize}));
vi.mock('@/lib/server/supabase-admin',()=>({getSupabaseAdmin:()=>({})}));
import {POST} from './route';
const previousFlag=process.env.RIESCADE_FRIENDS_ENABLED,previousKey=process.env.RIESCADE_RELAY_CONTROL_KEY;
beforeEach(()=>{vi.resetAllMocks();process.env.RIESCADE_FRIENDS_ENABLED='true';process.env.RIESCADE_RELAY_CONTROL_KEY='local-relay-control-key-for-tests-only';mocks.authorize.mockResolvedValue({room:'room',role:'host'});});
afterEach(()=>{if(previousFlag===undefined)delete process.env.RIESCADE_FRIENDS_ENABLED;else process.env.RIESCADE_FRIENDS_ENABLED=previousFlag;if(previousKey===undefined)delete process.env.RIESCADE_RELAY_CONTROL_KEY;else process.env.RIESCADE_RELAY_CONTROL_KEY=previousKey;});
const request=(key:string,body:unknown)=>new Request('https://test/api/app/friends/relay',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:JSON.stringify(body)});
it('rejects desktop tokens and body claims without control authorization',async()=>{
  expect((await POST(request('ries_user-token',{ticket:'signed',active:true}))).status).toBe(401);
  expect(mocks.authorize).not.toHaveBeenCalled();
});
it('checks signed tickets against active server state with no caching',async()=>{
  const response=await POST(request(process.env.RIESCADE_RELAY_CONTROL_KEY!,{ticket:'signed',active:true,room:'forged',role:'host'}));
  expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');
  expect(mocks.authorize).toHaveBeenCalledWith({},'signed',true);
});
it('fails closed and hides database details',async()=>{
  mocks.authorize.mockRejectedValue(new Error('private credentials'));
  const response=await POST(request(process.env.RIESCADE_RELAY_CONTROL_KEY!,{ticket:'signed'}));
  expect(response.status).toBe(500);expect(JSON.stringify(await response.json())).not.toContain('credentials');
});
