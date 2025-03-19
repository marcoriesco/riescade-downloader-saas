
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data as Subscription;
}

export async function getActiveSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, auth.users!inner(*)')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching active subscriptions:', error);
    return [];
  }

  return data;
}
