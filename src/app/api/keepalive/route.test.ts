import { afterEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({client:vi.fn()}));
vi.mock('@/lib/server/supabase-admin',()=>({getSupabaseAdmin:mocks.client}));
import {GET} from './route';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
afterEach(()=>{vi.clearAllMocks();if(url===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=url;if(key===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=key;});
it('does not initialize Supabase when configuration is absent',async()=>{
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  expect((await GET()).status).toBe(503);expect(mocks.client).not.toHaveBeenCalled();
});
it('executes a lightweight query only on request with configured credentials',async()=>{
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://test.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-server-key';
  mocks.client.mockReturnValue({from:()=>({select:()=>({limit:async()=>({error:null})})})});
  const response=await GET();expect(response.status).toBe(200);expect((await response.json()).alive).toBe(true);
});
