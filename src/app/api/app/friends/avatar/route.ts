import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertFriendsEnabled, updateSocialAvatar } from "@/lib/server/friends";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
function failure(error: unknown) {
  return NextResponse.json({error:error instanceof AppApiError ? error.message : "N\u00e3o foi poss\u00edvel salvar o avatar. Tente novamente."},{status:error instanceof AppApiError ? error.status : 500,headers});
}
export async function POST(request: Request) {
  try {
    assertFriendsEnabled(); const user=await authenticateAppRequest(request);
    const text=await request.text();
    if(text.length>710000)throw new AppApiError(413,"Escolha uma imagem menor.");
    let picture:unknown;
    try {picture=JSON.parse(text).picture;} catch {throw new AppApiError(400,"Imagem inv\u00e1lida.");}
    if(typeof picture!=="string" || !/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(picture))throw new AppApiError(400,"Imagem inv\u00e1lida.");
    const input=Buffer.from(picture.split(',')[1],'base64');
    let image:Buffer;
    try {
      if(input.length>524288)throw new Error();
      const metadata=await sharp(input,{limitInputPixels:40000000}).metadata();
      if(metadata.format!=="webp")throw new Error();
      image=await sharp(input,{limitInputPixels:40000000}).rotate().resize(512,512,{fit:'cover',withoutEnlargement:true}).webp({quality:85}).toBuffer();
      if(image.length>524288)throw new Error();
    }catch {throw new AppApiError(400,"Escolha uma imagem PNG, JPEG ou WebP v\u00e1lida.");}
    const db=getSupabaseAdmin(); const bucket=db.storage.from('online-avatars'); const path=`${user.id}/${randomUUID()}.webp`;
    const {error}=await bucket.upload(path,image,{contentType:'image/webp',upsert:false});
    if(error)throw new Error('Avatar upload failed');
    try {return NextResponse.json({profile:await updateSocialAvatar(db,user.id,bucket.getPublicUrl(path).data.publicUrl)},{headers});}
    catch(error){await bucket.remove([path]);throw error;}
  }catch(error){return failure(error);}
}
export async function DELETE(request: Request) {
  try {assertFriendsEnabled();const user=await authenticateAppRequest(request);return NextResponse.json({profile:await updateSocialAvatar(getSupabaseAdmin(),user.id,null)},{headers});}
  catch(error){return failure(error);}
}
