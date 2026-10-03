import { beforeEach,expect,it,vi } from 'vitest';
import sharp from 'sharp';
import {AppApiError} from '@/lib/server/app-auth';
const mocks=vi.hoisted(()=>({auth:vi.fn(),update:vi.fn(),upload:vi.fn(),remove:vi.fn()}));
vi.mock('@/lib/server/app-auth',async original=>({...await original<typeof import('@/lib/server/app-auth')>(),authenticateAppRequest:mocks.auth}));
vi.mock('@/lib/server/friends',async original=>({...await original<typeof import('@/lib/server/friends')>(),updateSocialAvatar:mocks.update}));
vi.mock('@/lib/server/supabase-admin',()=>({getSupabaseAdmin:()=>({storage:{from:()=>({upload:mocks.upload,remove:mocks.remove,getPublicUrl:(path:string)=>({data:{publicUrl:'https://example.com/'+path}})})}})}));
import {POST,DELETE} from './route';
const request=(body:unknown)=>new Request('https://test/avatar',{method:'POST',body:JSON.stringify(body)});
beforeEach(()=>{vi.resetAllMocks();process.env.RIESCADE_FRIENDS_ENABLED='true';mocks.auth.mockResolvedValue({id:'real-actor'});mocks.upload.mockResolvedValue({error:null});mocks.update.mockResolvedValue({avatar_url:'https://example.com/avatar.webp'});mocks.remove.mockResolvedValue({error:null});});
it('uploads a normalized image only under the authenticated account',async()=>{
 const buffer=await sharp({create:{width:10,height:10,channels:3,background:'#ff0088'}}).webp().toBuffer();
 const response=await POST(request({actorId:'victim',picture:'data:image/webp;base64,'+buffer.toString('base64')}));
 expect(response.status).toBe(200);expect(mocks.upload.mock.calls[0][0]).toMatch(/^real-actor\/[a-f0-9-]+\.webp$/);expect(mocks.update.mock.calls[0][1]).toBe('real-actor');expect(response.headers.get('cache-control')).toBe('no-store');
});
it('rejects invalid image bytes without uploading',async()=>{expect((await POST(request({picture:'data:image/webp;base64,YmFk'}))).status).toBe(400);expect(mocks.upload).not.toHaveBeenCalled();});
it('rejects arbitrary remote URLs',async()=>{expect((await POST(request({picture:'https://example.com/image'}))).status).toBe(400);expect(mocks.upload).not.toHaveBeenCalled();});
it('requires login before uploading',async()=>{mocks.auth.mockRejectedValue(new AppApiError(401,'Expired'));expect((await POST(request({picture:'bad'}))).status).toBe(401);expect(mocks.upload).not.toHaveBeenCalled();});
it('restores the Google avatar only for the authenticated actor',async()=>{expect((await DELETE(request({actorId:'victim'}))).status).toBe(200);expect(mocks.update).toHaveBeenCalledWith(expect.anything(),'real-actor',null);});
