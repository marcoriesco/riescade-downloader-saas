import { NextResponse } from "next/server";
import { authenticateSupabaseRequest, AppApiError } from "@/lib/server/app-auth";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { syncStripeSubscription } from "@/lib/server/stripe-billing";

export async function POST(request: Request) {
  try {
    const user = await authenticateSupabaseRequest(request);
    const { subscriptionId } = await request.json();
    if (!subscriptionId) {
      return NextResponse.json({ message: "Assinatura obrigatória" }, { status: 400 });
    }
    const { data } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("subscription_id")
      .eq("user_id", user.id)
      .eq("subscription_id", subscriptionId)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ message: "Assinatura não encontrada" }, { status: 404 });
    }
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe não configurado");
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    await syncStripeSubscription(subscription, user.id);
    return NextResponse.json({ success: true, status: subscription.status });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (!(error instanceof AppApiError)) {
      console.error("Cancelamento Stripe falhou:", error);
    }
    return NextResponse.json({ message: "Não foi possível cancelar a assinatura" }, { status });
  }
}
