import { NextResponse } from "next/server";
import { createCustomer, getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const { paymentMethodId, priceId, userId, userEmail } =
      await request.json();

    console.log("Request payload:", {
      paymentMethodId,
      priceId,
      userId,
      userEmail,
    });

    if (!paymentMethodId || !priceId || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use email from the request payload if available
    let email = userEmail;

    // If not provided in payload, try to get from Supabase
    if (!email) {
      const { data, error } = await supabase
        .from("profiles") // Tabela comum para armazenar perfis de usuários
        .select("email")
        .eq("id", userId)
        .single();

      if (error || !data || !data.email) {
        console.error("User error:", error);
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      email = data.email;
    }

    console.log("Using email:", email);

    // Check if customer already exists
    const { data: customerData } = await supabase
      .from("subscriptions")
      .select("customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = customerData?.customer_id;

    // Create a customer if one doesn't exist
    if (!customerId) {
      const customer = await createCustomer(email);
      customerId = customer.id;
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe client not initialized" },
        { status: 500 }
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save subscription to Supabase
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      subscription_id: subscription.id,
      customer_id: customerId,
      price_id: priceId,
      status: subscription.status,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payment_provider: "stripe",
    });

    return NextResponse.json({
      subscription: subscription.id,
      status: subscription.status,
      clientSecret: (
        (subscription.latest_invoice as Stripe.Invoice)
          .payment_intent as Stripe.PaymentIntent
      )?.client_secret,
    });
  } catch (error: unknown) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
