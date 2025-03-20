
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { message: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe is not initialized" },
        { status: 500 }
      );
    }

    // Verifica o evento com o Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      return NextResponse.json(
        { message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Processa diferentes tipos de eventos
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Checkout session completed:", session);

        // Atualiza o banco de dados
        if (session.customer && session.subscription && session.client_reference_id) {
          const { error } = await supabase.from("subscriptions").upsert({
            user_id: session.client_reference_id,
            subscription_id: session.subscription,
            customer_id: session.customer,
            status: "active",
            start_date: new Date().toISOString(),
            end_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            price_id: session.metadata?.price_id || "",
            plan_id: "default",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (error) {
            console.error("Error updating subscription:", error);
          }
        }
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object;
        const status = subscription.status;
        
        // Encontrar o usuário associado a esta inscrição
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("subscription_id", subscription.id)
          .single();

        if (subscriptionError || !subscriptionData) {
          console.error("Error finding subscription:", subscriptionError);
          break;
        }

        // Atualizar o status da assinatura
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscription.id);

        if (updateError) {
          console.error("Error updating subscription status:", updateError);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
