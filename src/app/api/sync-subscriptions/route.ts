import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com permissões de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Sincronizando assinaturas para usuário: ${userId}`);

    // 1. Obter o cliente Stripe
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe client not initialized" },
        { status: 500 }
      );
    }

    // 2. Buscar dados do usuário no Supabase
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("email, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Erro ao buscar usuário:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`Usuário encontrado: ${userData.email}`);

    // 3. Verificar se o usuário tem um customer_id no Stripe
    let customerId = userData.stripe_customer_id;

    // 4. Se não tiver customer_id, buscar pelo email ou criar um novo customer
    if (!customerId) {
      // Tentar encontrar customer pelo email
      const customers = await stripe.customers.list({
        email: userData.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log(`Customer encontrado pelo email: ${customerId}`);

        // Atualizar o usuário no Supabase com o customerId
        await supabaseAdmin
          .from("users")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      } else {
        // Criar novo customer
        const newCustomer = await stripe.customers.create({
          email: userData.email,
          metadata: { userId },
        });
        customerId = newCustomer.id;
        console.log(`Novo customer criado: ${customerId}`);

        // Atualizar o usuário no Supabase com o customerId
        await supabaseAdmin
          .from("users")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }
    }

    // 5. Buscar todas as assinaturas do cliente no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    console.log(
      `Encontradas ${subscriptions.data.length} assinaturas no Stripe`
    );

    // 6. Sincronizar cada assinatura com o Supabase
    const results = {
      synchronized: 0,
      failed: 0,
      subscriptions: [] as string[],
    };

    // Se existem múltiplas assinaturas, vamos manter apenas a mais recente/ativa
    let activeSubscription = null;

    // Classificar por status (ativas primeiro) e data (mais recentes primeiro)
    subscriptions.data.sort((a, b) => {
      // Primeiro, priorizar assinaturas ativas
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;

      // Em seguida, classificar por data de criação (mais recente primeiro)
      return b.created > a.created ? 1 : -1;
    });

    // Selecionar a melhor assinatura para manter (a primeira após a classificação)
    if (subscriptions.data.length > 0) {
      activeSubscription = subscriptions.data[0];

      // Remover todas as assinaturas existentes no Supabase para este usuário
      const { error: deleteError } = await supabaseAdmin
        .from("subscriptions")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        console.error(
          `Erro ao limpar assinaturas antigas: ${deleteError.message}`
        );
      } else {
        console.log(`Assinaturas antigas removidas para o usuário ${userId}`);
      }

      try {
        const priceId = activeSubscription.items.data[0]?.price.id || "";

        // Criar a assinatura ativa no Supabase
        const { error } = await supabaseAdmin.from("subscriptions").insert({
          subscription_id: activeSubscription.id,
          user_id: userId,
          customer_id: customerId,
          price_id: priceId,
          status: activeSubscription.status,
          plan_id: priceId,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error(
            `Erro ao sincronizar assinatura ${activeSubscription.id}:`,
            error
          );
          results.failed++;
        } else {
          console.log(
            `Assinatura ${activeSubscription.id} sincronizada com sucesso`
          );
          results.synchronized++;
          results.subscriptions.push(activeSubscription.id);
        }
      } catch (error) {
        console.error(
          `Erro ao processar assinatura ${activeSubscription.id}:`,
          error
        );
        results.failed++;
      }
    } else {
      console.log(`Nenhuma assinatura encontrada para o usuário ${userId}`);
    }

    // 7. Retornar resultados
    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro na sincronização de assinaturas:", error);
    return NextResponse.json(
      { error: "Error syncing subscriptions" },
      { status: 500 }
    );
  }
}
