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
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  if (!signature) {
    return NextResponse.json(
      { message: "No signature found" },
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

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { message: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    console.log(`Webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.pending_update_applied":
      case "customer.subscription.pending_update_expired":
      case "customer.subscription.trial_will_end":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `Processing subscription: ${subscription.id}, Status: ${subscription.status}`
        );
        await updateSubscription(subscription, stripe);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          console.log(
            `Invoice payment succeeded for subscription: ${invoice.subscription}`
          );
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await updateSubscription(subscription, stripe);
        }
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        if (failedInvoice.subscription) {
          console.log(
            `Invoice payment failed for subscription: ${failedInvoice.subscription}`
          );
          const subscription = await stripe.subscriptions.retrieve(
            failedInvoice.subscription as string
          );
          await updateSubscription(subscription, stripe);
        }
        break;

      case "customer.deleted":
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer deleted: ${customer.id}`);
        // Atualizar todas as assinaturas deste cliente para canceladas
        const { data } = await supabaseAdmin
          .from("subscriptions")
          .select("subscription_id")
          .eq("customer_id", customer.id);

        if (data && data.length > 0) {
          for (const sub of data) {
            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: "canceled",
                updated_at: new Date().toISOString(),
              })
              .eq("subscription_id", sub.subscription_id);
          }
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return NextResponse.json(
      { message: "Error handling webhook event" },
      { status: 500 }
    );
  }
}

async function updateSubscription(
  subscription: Stripe.Subscription,
  stripe: Stripe
) {
  try {
    // Verificar se temos registro desta assinatura
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, customer_id")
      .eq("subscription_id", subscription.id)
      .single();

    let userId = existingSubscription?.user_id;
    const customerId = subscription.customer as string;

    // Se não encontrarmos a assinatura, tentamos encontrar o usuário pelo customer_id
    if (!userId && customerId) {
      const { data: customerData } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .eq("customer_id", customerId)
        .single();

      userId = customerData?.user_id;
    }

    // Se ainda não temos userId, tentamos obter dos metadados do cliente
    if (!userId) {
      try {
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;
        userId = customer.metadata.userId;
      } catch (error) {
        console.error("Error retrieving customer:", error);
      }
    }

    if (!userId) {
      console.error(`Could not find user for subscription: ${subscription.id}`);
      return;
    }

    // Obter detalhes do plano
    let priceId = null;
    let planId = null;

    if (subscription.items.data.length > 0) {
      const item = subscription.items.data[0];
      priceId = item.price.id;
      planId = item.plan?.id || item.price.id;
    }

    // Atualizar a assinatura no Supabase
    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      subscription_id: subscription.id,
      customer_id: customerId,
      status: subscription.status,
      price_id: priceId,
      plan_id: planId,
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
      console.error("Error updating subscription in Supabase:", error);
    } else {
      console.log(
        `Subscription ${subscription.id} updated successfully. Status: ${subscription.status}`
      );
    }
  } catch (error) {
    console.error("Error in updateSubscription:", error);
  }
}
