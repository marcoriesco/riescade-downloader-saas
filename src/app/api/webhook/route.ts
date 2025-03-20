import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) return new Response('Webhook Error: No signature', { status: 400 });
    
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  try {
    // Handle subscription events
    if (event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated') {
      
      const subscription = event.data.object;
      
      // Find the subscription in the database
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', subscription.id)
        .single();
      
      if (subError && subError.code !== 'PGRST116') {
        console.error('Error finding subscription:', subError);
        return new Response('Error finding subscription', { status: 500 });
      }
      
      const startDate = new Date(subscription.current_period_start * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);
      
      if (!subData) {
        // Create a new subscription record
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: subscription.metadata.userId,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          });
        
        if (insertError) {
          console.error('Error creating subscription:', insertError);
          return new Response('Error creating subscription', { status: 500 });
        }
      } else {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return new Response('Error updating subscription', { status: 500 });
        }
      }
    }

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      
      if (session.payment_status === 'paid') {
        // Update user's subscription status
        // This is just a placeholder, the actual subscription update
        // is handled by the customer.subscription.created/updated events
        console.log(`Payment succeeded for user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}
