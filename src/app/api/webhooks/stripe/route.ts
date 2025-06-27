import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inicializar Resend apenas se a API key estiver configurada
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  console.log("Webhook event received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log("Processing completed checkout session:", session.id);

  // Verificar se é um produto físico (HD)
  const isPhysicalProduct =
    session.metadata?.price_id ===
    process.env.NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID;

  if (isPhysicalProduct) {
    await sendOrderConfirmationEmail(session);
    await saveOrderToDatabase(session);
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("Payment intent succeeded:", paymentIntent.id);
}

async function sendOrderConfirmationEmail(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const shippingAddress = session.customer_details?.address;
  const cep = session.metadata?.cep;

  // Extrair valor do frete de forma segura
  let shippingValue = 0;
  if (session.shipping_options && session.shipping_options.length > 0) {
    const shippingOption = session.shipping_options[0];
    if (
      typeof shippingOption.shipping_rate === "object" &&
      shippingOption.shipping_rate?.fixed_amount
    ) {
      shippingValue = shippingOption.shipping_rate.fixed_amount.amount;
    }
  }

  if (!customerEmail) {
    console.error("No customer email found in session");
    return;
  }

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pedido Confirmado - HD Nintendo Switch</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .shipping-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total { font-size: 24px; font-weight: bold; color: #2d5a2d; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 Pedido Confirmado!</h1>
          <p>Seu HD Nintendo Switch está sendo preparado</p>
        </div>
        
        <div class="content">
          <h2>Olá ${customerName || "Cliente"}!</h2>
          <p>Seu pedido foi confirmado e está sendo processado. Aqui estão os detalhes:</p>
          
          <div class="order-details">
            <h3>📦 Detalhes do Pedido</h3>
            <p><strong>Produto:</strong> HD 1TB Nintendo Switch</p>
            <p><strong>Inclui:</strong> Emuladores configurados + Artes dos jogos</p>
            <p><strong>Valor do Produto:</strong> R$ 350,00</p>
            <p><strong>Frete:</strong> R$ ${
              shippingValue
                ? (shippingValue / 100).toFixed(2).replace(".", ",")
                : "0,00"
            }</p>
            <p class="total">Total: R$ ${
              session.amount_total
                ? (session.amount_total / 100).toFixed(2).replace(".", ",")
                : "0,00"
            }</p>
          </div>
          
          <div class="shipping-info">
            <h3>🚚 Endereço de Entrega</h3>
            <p><strong>Nome:</strong> ${customerName || "N/A"}</p>
            <p><strong>CEP:</strong> ${cep || "N/A"}</p>
            ${
              shippingAddress
                ? `
              <p><strong>Endereço:</strong> ${shippingAddress.line1 || ""}</p>
              ${
                shippingAddress.line2
                  ? `<p><strong>Complemento:</strong> ${shippingAddress.line2}</p>`
                  : ""
              }
              <p><strong>Cidade:</strong> ${shippingAddress.city || ""}</p>
              <p><strong>Estado:</strong> ${shippingAddress.state || ""}</p>
            `
                : "<p>Endereço será coletado durante o checkout</p>"
            }
          </div>
          
          <div class="order-details">
            <h3>📋 Próximos Passos</h3>
            <ol>
              <li>Seu pedido será processado em até 24 horas</li>
              <li>Você receberá um email com o código de rastreamento</li>
              <li>O prazo de entrega é de 3-10 dias úteis</li>
              <li>Em caso de dúvidas, entre em contato conosco</li>
            </ol>
          </div>
        </div>
        
        <div class="footer">
          <p>Obrigado por escolher a RIESCADE!</p>
          <p>Para suporte: riescade@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (resend && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "RIESCADE <noreply@riescade.com.br>",
        to: customerEmail,
        subject: "Pedido Confirmado - HD Nintendo Switch",
        html: emailContent,
      });
      console.log("✅ Email de confirmação enviado para:", customerEmail);
    } else {
      console.log(
        "⚠️ RESEND_API_KEY não configurada. Email seria enviado para:",
        customerEmail
      );
      console.log("Conteúdo do email:", emailContent);
    }
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
  }
}

async function saveOrderToDatabase(session: Stripe.Checkout.Session) {
  try {
    // Extrair valor do frete de forma segura
    let shippingValue = 0;
    if (session.shipping_options && session.shipping_options.length > 0) {
      const shippingOption = session.shipping_options[0];
      if (
        typeof shippingOption.shipping_rate === "object" &&
        shippingOption.shipping_rate?.fixed_amount
      ) {
        shippingValue = shippingOption.shipping_rate.fixed_amount.amount;
      }
    }

    const orderData = {
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      amount_total: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
      shipping_address: session.customer_details?.address,
      cep: session.metadata?.cep,
      shipping_value: shippingValue,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(orderData);

    if (error) {
      console.error("Error saving order to database:", error);
    } else {
      console.log("Order saved to database:", data);
    }
  } catch (error) {
    console.error("Error in saveOrderToDatabase:", error);
  }
}
