import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authenticateSupabaseRequest, AppApiError } from "@/lib/server/app-auth";
import { getStripe } from "@/lib/stripe";
import { syncStripeSubscription } from "@/lib/server/stripe-billing";

export async function POST(request: Request) {
  try {
    const user = await authenticateSupabaseRequest(request);
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ message: "Sessão obrigatória" }, { status: 400 });
    }
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe não configurado");
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    if (
      session.status !== "complete" ||
      session.mode !== "subscription" ||
      (session.client_reference_id !== user.id && session.metadata?.userId !== user.id)
    ) {
      return NextResponse.json({ message: "Sessão inválida" }, { status: 403 });
    }
    const subscription = session.subscription as Stripe.Subscription;
    const result = await syncStripeSubscription(subscription, user.id);
    return NextResponse.json({
      success: true,
      status: result.status,
      currentPeriodEnd: result.end_date,
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    console.error("Verificação Stripe falhou:", error);
    return NextResponse.json({ message: "Não foi possível verificar a assinatura" }, { status });
  }
}
