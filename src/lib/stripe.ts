import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Server-only Stripe client
let stripe: Stripe | null = null;

export const getStripe = () => {
  console.log("=== VERIFICANDO CLIENTE STRIPE ===");
  console.log("Environment check:", {
    isServer: typeof window === "undefined",
    hasStripeClient: !!stripe,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
  });

  if (
    typeof window === "undefined" &&
    !stripe &&
    typeof process.env.STRIPE_SECRET_KEY === "string"
  ) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
    console.log("✅ Stripe client initialized successfully");
  } else if (!stripe) {
    console.warn(
      "❌ Stripe secret key not available or not in server environment"
    );
  } else {
    console.log("✅ Stripe client already initialized");
  }
  return stripe;
};

export async function createCheckoutSession(
  customerId: string,
  priceId: string
) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`,
  });

  return session;
}

export async function createCustomer(email: string, name?: string) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer;
}

export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}
