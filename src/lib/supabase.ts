import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Use the Supabase URL and key from the integrations/supabase/client.ts file
const supabaseUrl = "https://tmbwwpjbucndwbmefgyl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYnd3cGpidWNuZHdibWVmZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzk5MTcsImV4cCI6MjA1NzkxNTkxN30.xy9HGYr6a54QkFPtsCxAPF_ksSLc2hb7Ry4hfeKAmLU";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Subscription = {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  plan_id: string;
  subscription_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
};

export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data as Subscription;
}

export async function getActiveSubscriptions() {
  // Updated query to use auth_users instead of auth.users for better type safety
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, auth_users:user_id(email)")
    .eq("status", "active");

  if (error) {
    console.error("Error fetching active subscriptions:", error);
    return [];
  }

  return data;
}

// Create a new subscription or update existing one
export async function upsertSubscription(
  subscription: Partial<Subscription> & { user_id: string }
): Promise<void> {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      ...subscription,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Error upserting subscription:", error);
    throw error;
  }
}
