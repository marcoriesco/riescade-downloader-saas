import { NextResponse } from "next/server";
import { authenticateSupabaseRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await authenticateSupabaseRequest(request);
    const { sessionId } = await params;
    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    return NextResponse.json({ error: "Não foi possível consultar o pedido" }, { status });
  }
}
