
import { headers } from "next/headers";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  // Fixed: Get headers synchronously instead of as a Promise
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription in Supabase
        const { error } = await supabase.from("subscriptions").upsert({
          subscription_id: subscription.id,
          user_id: subscription.metadata.userId,
          status: subscription.status,
          price_id: subscription.items.data[0].price.id,
          start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_start: subscription.trial_start 
            ? new Date(subscription.trial_start * 1000).toISOString() 
            : null,
          trial_end: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString() 
            : null,
          customer_id: subscription.customer as string,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error updating subscription:", error);
          return new Response(`Webhook error: ${error.message}`, { 
            status: 400 
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (err) {
    console.error(`Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return new Response(
      `Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 400 }
    );
  }
}
