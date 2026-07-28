import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const { data, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("status,price_id,start_date,end_date,trial_end,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ subscription: data ?? null });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("Desktop subscription lookup failed:", error);
    return NextResponse.json(
      { error: status === 500 ? "Não foi possível consultar a assinatura" : (error as Error).message },
      { status }
    );
  }
}
