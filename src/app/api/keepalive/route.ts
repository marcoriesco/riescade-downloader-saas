import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Use as variáveis de ambiente do seu projeto
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Query leve que conta como atividade no Supabase
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw error;
    
    return NextResponse.json({ 
      alive: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    console.error("Erro no keepalive:", err.message);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}