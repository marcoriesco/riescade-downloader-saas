import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { LATEST_APP_DOWNLOAD_URL, syncStripeSubscription } from "@/lib/server/stripe-billing";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }
  try {
    if (event.type === "checkout.session.completed") {
      await handleCompletedCheckout(stripe, event.data.object as Stripe.Checkout.Session);
    } else if ([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ].includes(event.type)) {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Falha no evento Stripe ${event.id}:`, error);
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 });
  }
}

async function handleCompletedCheckout(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode === "subscription" && session.subscription) {
    const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    await syncStripeSubscription(await stripe.subscriptions.retrieve(id), session.metadata?.userId);
    await sendSubscriptionWelcome(session);
  } else if (
    session.mode === "payment" &&
    session.metadata?.price_id === process.env.NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID
  ) {
    await saveOrder(session);
    await sendOrderConfirmation(session);
  }
}

async function saveOrder(session: Stripe.Checkout.Session) {
  const { error } = await getSupabaseAdmin().from("orders").upsert({
    stripe_session_id: session.id,
    user_id: session.metadata?.userId,
    customer_email: session.customer_details?.email,
    customer_name: session.customer_details?.name,
    amount_total: session.amount_total,
    currency: session.currency,
    status: session.payment_status,
    shipping_address: session.customer_details?.address,
    cep: session.metadata?.cep,
    shipping_value: session.total_details?.amount_shipping ?? 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_session_id" });
  if (error) throw error;
}

async function sendSubscriptionWelcome(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  if (!resend || !email) return;
  await resend.emails.send({
    from: "RIESCADE <noreply@riescade.com.br>",
    to: email,
    subject: "Sua assinatura RIESCADE está ativa",
    html: `<h1>Bem-vindo à RIESCADE!</h1>
      <p>Sua assinatura está ativa. Para começar:</p>
      <ol>
        <li><a href="${LATEST_APP_DOWNLOAD_URL}">Baixe a versão mais recente do RIESCADE OS</a>.</li>
        <li>Extraia o arquivo e abra o aplicativo.</li>
        <li>Entre em <strong>Configurações → Minha conta</strong>.</li>
        <li>Faça login com a mesma conta Google usada na assinatura.</li>
        <li>Escolha um jogo no app e use o botão de download.</li>
      </ol>
      <p>O link sempre baixa a versão mais recente publicada.</p>`,
  });
}

async function sendOrderConfirmation(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  if (!resend || !email) return;
  const total = ((session.amount_total ?? 0) / 100).toFixed(2).replace(".", ",");
  await resend.emails.send({
    from: "RIESCADE <noreply@riescade.com.br>",
    to: email,
    subject: "Pedido confirmado - HD Nintendo Switch",
    html: `<h1>Pedido confirmado</h1>
      <p>Olá ${session.customer_details?.name || "Cliente"}, seu pedido do HD 1TB Nintendo Switch foi confirmado.</p>
      <p><strong>Total: R$ ${total}</strong></p>
      <p>Você receberá o código de rastreamento por email após o envio.</p>`,
  });
}
