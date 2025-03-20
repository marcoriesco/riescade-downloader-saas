import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Cliente Supabase com permissões de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe client not initialized" },
        { status: 500 }
      );
    }

    // Recuperar a sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (!session || session.status !== "complete") {
      return NextResponse.json(
        { message: "Session not complete" },
        { status: 400 }
      );
    }

    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;
    const userId = session.metadata?.userId;

    if (!subscription || !userId) {
      return NextResponse.json(
        { message: "Missing subscription or user information" },
        { status: 400 }
      );
    }

    // Atualizar ou criar o registro de assinatura no Supabase
    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      subscription_id: subscription.id,
      customer_id: customer.id,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      plan_id:
        subscription.items.data[0]?.plan?.id ||
        subscription.items.data[0]?.price.id,
      start_date: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving subscription to Supabase:", error);
      return NextResponse.json(
        { message: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: subscription.status,
      currentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
