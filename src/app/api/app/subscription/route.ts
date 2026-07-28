import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const { data, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("status,subscription_id,price_id,start_date,end_date,trial_end,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ subscription: null });

    let details = {};
    const stripe = getStripe();
    if (stripe && data.subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(data.subscription_id, {
        expand: ["items.data.price.product"],
      });
      const price = subscription.items.data[0]?.price;
      const product = price?.product;
      details = {
        status: subscription.status,
        plan_name:
          typeof product === "object" && "name" in product ? product.name : null,
        amount: price?.unit_amount ?? null,
        currency: price?.currency ?? null,
        interval: price?.recurring?.interval ?? null,
        interval_count: price?.recurring?.interval_count ?? null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      };
    }

    return NextResponse.json({ subscription: { ...data, ...details } });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("Desktop subscription lookup failed:", error);
    return NextResponse.json(
      { error: status === 500 ? "Não foi possível consultar a assinatura" : (error as Error).message },
      { status }
    );
  }
}
