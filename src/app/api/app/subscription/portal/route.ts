import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br";

export async function POST(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const { data, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data?.customer_id) {
      throw new AppApiError(404, "Nenhuma assinatura foi encontrada para esta conta");
    }

    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe não configurado");
    const portal = await stripe.billingPortal.sessions.create({
      customer: data.customer_id,
      return_url: `${SITE_URL}/dashboard`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("Stripe customer portal failed:", error);
    return NextResponse.json(
      { error: status === 500 ? "Não foi possível abrir o gerenciamento da assinatura" : (error as Error).message },
      { status }
    );
  }
}
