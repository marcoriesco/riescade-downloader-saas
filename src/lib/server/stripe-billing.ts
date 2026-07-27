import Stripe from "stripe";
import { getSupabaseAdmin } from "./supabase-admin";

export const LATEST_APP_DOWNLOAD_URL =
  "https://github.com/marcoriesco/RIESCADE-OS/releases/latest/download/RIESCADE_OS.7z";

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string
) {
  const supabase = getSupabaseAdmin();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  let userId = subscription.metadata.userId || fallbackUserId;
  if (!userId) {
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("user_id")
      .or(`subscription_id.eq.${subscription.id},customer_id.eq.${customerId}`)
      .limit(1)
      .maybeSingle();
    userId = existing?.user_id;
  }
  if (!userId) {
    throw new Error(`Subscription ${subscription.id} has no userId metadata`);
  }

  const firstItem = subscription.items.data[0];
  const payload = {
    user_id: userId,
    subscription_id: subscription.id,
    customer_id: customerId,
    status: subscription.status,
    price_id: firstItem?.price.id ?? null,
    plan_id: firstItem?.price.id ?? null,
    start_date: new Date(subscription.current_period_start * 1000).toISOString(),
    end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    payment_provider: "stripe",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
  return payload;
}
