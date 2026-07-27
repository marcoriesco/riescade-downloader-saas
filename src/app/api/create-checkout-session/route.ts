import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authenticateSupabaseRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br";

export async function POST(request: Request) {
  try {
    const user = await authenticateSupabaseRequest(request);
    const { priceId } = await request.json();
    const subscriptionPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

    if (!priceId || priceId !== subscriptionPrice) {
      return NextResponse.json({ message: "Plano inválido" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: activeSubscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle();
    if (activeSubscription) {
      return NextResponse.json({ url: `${SITE_URL}/dashboard?existing=true` });
    }

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe não configurado");
    const name =
      user.user_metadata?.full_name || user.user_metadata?.name || undefined;
    let customerId = existing?.customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/dashboard?canceled=true`,
      metadata: { userId: user.id, price_id: priceId },
      mode: "subscription",
      subscription_data: { metadata: { userId: user.id } },
    };

    const session = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (!(error instanceof AppApiError)) {
      console.error("Checkout Stripe falhou:", error);
    }
    return NextResponse.json(
      { message: status === 500 ? "Não foi possível iniciar o pagamento" : (error as Error).message },
      { status }
    );
  }
}
