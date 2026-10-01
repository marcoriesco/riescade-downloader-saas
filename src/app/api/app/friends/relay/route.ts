import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { AppApiError } from '@/lib/server/app-errors';
import { assertFriendsEnabled } from '@/lib/server/friends';
import { authorizeRelay } from '@/lib/server/private-rooms';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
export const dynamic='force-dynamic';
export async function POST(request: Request) {
  try {
    assertFriendsEnabled();
    const key=process.env.RIESCADE_RELAY_CONTROL_KEY;
    const received=Buffer.from(request.headers.get('authorization') || '');
    const expected=Buffer.from(`Bearer ${key}`);
    if (!key || key.length<32 || received.length!==expected.length || !timingSafeEqual(received,expected)) throw new AppApiError(401,'Não autorizado.');
    const text=await request.text();
    if (text.length>4096) throw new AppApiError(413,'Solicitação muito grande.');
    let body;
    try {body=JSON.parse(text);} catch {throw new AppApiError(400,'Solicitação inválida.');}
    if (!body || typeof body.ticket!=='string') throw new AppApiError(400,'Credencial inválida.');
    return NextResponse.json(await authorizeRelay(getSupabaseAdmin(),body.ticket,body.active===true),{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    return NextResponse.json({error:error instanceof AppApiError ? error.message : 'Relay indisponível.'},{status:error instanceof AppApiError ? error.status : 500,headers:{'Cache-Control':'no-store'}});
  }
}
