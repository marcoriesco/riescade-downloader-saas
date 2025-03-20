import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  plan_id: string;
  subscription_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  trial_start: string;
  trial_end: string;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }

  return data;
}
