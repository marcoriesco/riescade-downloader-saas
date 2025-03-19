import { supabase } from "./supabase";
import { simulateWebhookEvent } from "@/integrations/stripe";

// Replace with your actual Stripe publishable key
export const STRIPE_KEY =
  "pk_live_51R491BCTgguXlFqctJPUJwyTBcKwiLU5YU5U5GLQ6aDngF4mvOmlxT0SwDRMdnIx4tisJBJ3ycihu8KiSwQafFs200E3eOSUzF";

// Fixed price for the subscription (R$30.00)
export const SUBSCRIPTION_PRICE_ID = "price_monthly_subscription";
export const SUBSCRIPTION_PRICE_AMOUNT = 30.0;
export const SUBSCRIPTION_CURRENCY = "brl";

// Create Stripe checkout session for subscription
export async function createCheckoutSession(userId: string) {
  try {
    // In a real implementation, this would call your backend API to create a Stripe checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        priceId: SUBSCRIPTION_PRICE_ID,
      }),
    });

    const { sessionId, error } = await response.json();

    if (error) {
      throw new Error(error.message);
    }

    return { sessionId };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Create a mock function for simulation when there's no backend
export async function mockCreateCheckoutSession(userId: string) {
  console.log(
    `Creating checkout session for user ${userId} with price ${SUBSCRIPTION_PRICE_ID}`
  );

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate successful subscription creation by triggering webhook event
  await simulateWebhookEvent(userId, "active");

  // In a real application, this would redirect to Stripe Checkout
  console.log("Subscription activated successfully");

  return { sessionId: "mock_session_id" };
}

// Update subscription status in Supabase
export async function updateSubscriptionStatus(userId: string, status: string) {
  try {
    // Simulate a webhook event
    await simulateWebhookEvent(userId, status);
    return true;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}
