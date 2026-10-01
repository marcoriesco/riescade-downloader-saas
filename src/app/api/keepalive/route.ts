import { NextResponse } from "next/server";
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return NextResponse.json({ error: 'Serviço temporariamente indisponível.' }, { status: 503 });
    }
    const supabase = getSupabaseAdmin();
    // Query leve que conta como atividade no Supabase
    const { error } = await supabase.from("blog_posts").select("id").limit(1);
    if (error) throw error;
    
    return NextResponse.json({ 
      alive: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error("Erro no keepalive:", errorMessage);
    return NextResponse.json({ 
      error: 'Não foi possível verificar o serviço.'
    }, { status: 500 });
  }
}
