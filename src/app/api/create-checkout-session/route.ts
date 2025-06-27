import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { STRIPE_CONFIG } from "@/lib/constants";

// Cliente Supabase com permissões de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    console.log("=== INICIANDO CRIAÇÃO DE SESSÃO DE CHECKOUT ===");

    const { priceId, userId, userEmail, userName, shippingValue, cep } =
      await request.json();

    console.log("Dados recebidos:", {
      priceId,
      userId,
      userEmail,
      userName,
      shippingValue,
      cep,
    });

    console.log("Variáveis de ambiente disponíveis:", {
      NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID:
        process.env.NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
        ? "✅ Configurada"
        : "❌ Não configurada",
    });

    if (!priceId || !userId || !userEmail) {
      console.error("Missing required fields:", { priceId, userId, userEmail });
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar se é um produto físico (HD) ou assinatura
    const isPhysicalProduct = priceId === STRIPE_CONFIG.HD_SWITCH_1TB_PRICE_ID;

    console.log("Product type check:", {
      priceId,
      expectedPriceId: STRIPE_CONFIG.HD_SWITCH_1TB_PRICE_ID,
      isPhysicalProduct,
    });

    if (!isPhysicalProduct) {
      // Lógica existente para assinaturas
      const { data: existingSubscriptions, error: subError } =
        await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active");

      if (subError) {
        console.error("Erro ao verificar assinaturas existentes:", subError);
      } else if (existingSubscriptions && existingSubscriptions.length > 0) {
        console.log(`Usuário ${userId} já possui uma assinatura ativa`);

        return NextResponse.json({
          message: "Assinatura ativa encontrada",
          url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&existing=true`,
          subscription: existingSubscriptions[0],
        });
      }
    }

    // Check if we have a Stripe customer already
    const { data: customerData } = await supabaseAdmin
      .from("subscriptions")
      .select("customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = customerData?.customer_id;

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe client not initialized" },
        { status: 500 }
      );
    }

    // Create a customer if we don't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName || undefined,
        metadata: {
          userId,
          fullName: userName || "",
        },
      });
      customerId = customer.id;
    } else if (userName) {
      await stripe.customers.update(customerId, {
        name: userName,
        metadata: {
          fullName: userName,
        },
      });
    }

    // Configuração base da sessão
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${
        request.headers.get("origin") || "http://localhost:3000"
      }/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        request.headers.get("origin") || "http://localhost:3000"
      }/dashboard?canceled=true`,
      metadata: {
        userId,
        price_id: priceId,
        fullName: userName || "",
        cep: cep || "",
      },
      client_reference_id: userId,
    };

    if (isPhysicalProduct) {
      // Configuração para produto físico
      sessionConfig.mode = "payment";
      sessionConfig.shipping_address_collection = {
        allowed_countries: ["BR"],
      };

      if (shippingValue && shippingValue > 0) {
        sessionConfig.shipping_options = [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: shippingValue, currency: "brl" },
              display_name: "Frete calculado",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 3 },
                maximum: { unit: "business_day", value: 10 },
              },
            },
          },
        ];
      }
    } else {
      // Configuração para assinatura
      sessionConfig.mode = "subscription";
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Sessão criada com sucesso:", {
      sessionId: session.id,
      url: session.url,
      mode: session.mode,
      customerId: session.customer,
    });

    // Salvar relação inicial no banco de dados (apenas para assinaturas)
    if (!isPhysicalProduct) {
      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        customer_id: customerId,
        price_id: priceId,
        status: "incomplete",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    console.log("=== SESSÃO DE CHECKOUT CRIADA COM SUCESSO ===");
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("=== ERRO NA CRIAÇÃO DE SESSÃO DE CHECKOUT ===");
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
