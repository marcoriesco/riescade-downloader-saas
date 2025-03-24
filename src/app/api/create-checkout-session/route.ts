import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com permissões de serviço
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail, userName } = await request.json();

    console.log("Creating checkout session for:", {
      priceId,
      userId,
      userEmail,
      userName,
    });

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já tem uma assinatura ativa
    const { data: existingSubscriptions, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (subError) {
      console.error("Erro ao verificar assinaturas existentes:", subError);
    } else if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log(`Usuário ${userId} já possui uma assinatura ativa`);

      // Redirecionar para a página de sucesso, sem criar nova assinatura
      // Isso evita duplicatas mas permite que o usuário "tente comprar" novamente
      return NextResponse.json({
        message: "Assinatura ativa encontrada",
        url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&existing=true`,
        subscription: existingSubscriptions[0],
      });
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
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
      },
      client_reference_id: userId,
    });

    // Salvar relação inicial no banco de dados
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      customer_id: customerId,
      price_id: priceId,
      status: "incomplete",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
