import { NextResponse } from "next/server";

import { Stripe } from "stripe";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Webhook Error: Stripe signature missing");
      return new NextResponse(
        JSON.stringify({ error: "Webhook Error: Stripe signature missing" }),
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error("Stripe client not initialized");
      return new NextResponse(
        JSON.stringify({ error: "Stripe client not initialized" }),
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log(`✅ Evento recebido: ${event.type}`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Webhook Error: ${error.message}`);
      return new NextResponse(
        JSON.stringify({ error: `Webhook Error: ${error.message}` }),
        { status: 400 }
      );
    }

    // Processando eventos específicos
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          console.log(
            `Processando subscription ${event.type} para ID: ${subscription.id}`
          );
          await updateSubscription(stripe, subscription);
          break;

        case "invoice.payment_succeeded":
          // Quando um pagamento é bem sucedido, encontre a subscription associada e atualize
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Pagamento bem-sucedido para fatura: ${invoice.id}`);

          if (invoice.subscription) {
            const subscriptionId =
              typeof invoice.subscription === "string"
                ? invoice.subscription
                : invoice.subscription.id;

            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            console.log(
              `Atualizando subscription após pagamento: ${subscription.id}`
            );
            await updateSubscription(stripe, subscription);
          }
          break;

        case "invoice.payment_failed":
          // Quando um pagamento falha, pode precisar atualizar o status
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log(`Pagamento falhou para fatura: ${failedInvoice.id}`);

          if (failedInvoice.subscription) {
            const subscriptionId =
              typeof failedInvoice.subscription === "string"
                ? failedInvoice.subscription
                : failedInvoice.subscription.id;

            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            console.log(
              `Atualizando subscription após falha de pagamento: ${subscription.id}`
            );
            await updateSubscription(stripe, subscription);
          }
          break;

        case "customer.deleted":
          // Quando um cliente é excluído, marque todas as suas subscriptions como canceladas
          const customer = event.data.object as Stripe.Customer;
          console.log(`Cliente excluído: ${customer.id}`);

          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("customer_id", customer.id);

          if (error) {
            console.error(
              `Erro ao atualizar subscriptions para cliente excluído: ${error.message}`
            );
          } else {
            console.log(
              `Subscriptions atualizadas para cliente excluído: ${customer.id}`
            );
          }
          break;

        default:
          console.log(`Evento não processado: ${event.type}`);
      }

      return NextResponse.json({ received: true });
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Erro processando webhook: ${error.message}`);
      return new NextResponse(
        JSON.stringify({ error: `Erro processando webhook: ${error.message}` }),
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Erro processando webhook: ${error.message}`);
    return new NextResponse(
      JSON.stringify({ error: `Erro processando webhook: ${error.message}` }),
      { status: 500 }
    );
  }
}

async function updateSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  console.log(`Iniciando atualização da subscription: ${subscription.id}`);
  console.log(`Status da subscription: ${subscription.status}`);

  try {
    // Obtém o ID de preço do primeiro item (assumindo que temos apenas um item)
    const priceId = subscription.items.data[0]?.price.id || "";
    console.log(`Price ID: ${priceId}`);

    // Obtém o ID do cliente da subscription
    const customerId = subscription.customer as string;
    console.log(`Customer ID: ${customerId}`);

    // Tenta encontrar o user_id baseado no customer_id
    const { data: existingSubscriptionData } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, id")
      .eq("subscription_id", subscription.id)
      .maybeSingle();

    let userId = existingSubscriptionData?.user_id;
    const existingRowId = existingSubscriptionData?.id;

    // Se não encontrar o user_id, tenta obter dos metadados do cliente
    if (!userId) {
      console.log(
        `Nenhum user_id encontrado para customer_id: ${customerId}, buscando metadados do cliente`
      );

      try {
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;
        userId = (customer.metadata?.userId ||
          customer.metadata?.user_id) as string;
        console.log(`User ID obtido dos metadados do cliente: ${userId}`);

        // Se encontrarmos o user_id, vamos verificar se temos os dados do usuário no Supabase
        if (userId) {
          const { data: userData } = await supabaseAdmin
            .from("users")
            .select("id, email, raw_user_meta_data")
            .eq("id", userId)
            .single();

          // Se temos os dados do usuário e o nome não está definido no Stripe, atualizamos
          if (userData && !customer.name && userData.raw_user_meta_data) {
            const userMeta = userData.raw_user_meta_data as Record<
              string,
              unknown
            >;
            const fullName =
              (userMeta.full_name as string) || (userMeta.name as string) || "";

            if (fullName) {
              console.log(`Atualizando nome do cliente no Stripe: ${fullName}`);
              await stripe.customers.update(customerId, {
                name: fullName,
                metadata: {
                  ...customer.metadata,
                  fullName,
                },
              });
            }
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error(`Erro ao buscar cliente: ${error.message}`);
      }
    }

    if (!userId) {
      console.error(
        `Não foi possível determinar user_id para subscription: ${subscription.id}`
      );
      return;
    }

    // O status da subscription no Stripe (active, canceled, etc)
    const status = subscription.status;

    // Antes de atualizar, verificar se já existe alguma outra assinatura para este usuário
    // Se existir e não for a atual, vamos excluí-la para manter apenas uma
    const { data: existingSubscriptions } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .neq("subscription_id", subscription.id);

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log(
        `Encontradas ${existingSubscriptions.length} assinaturas antigas para o usuário ${userId}. Removendo...`
      );

      for (const existingSub of existingSubscriptions) {
        const { error: deleteError } = await supabaseAdmin
          .from("subscriptions")
          .delete()
          .eq("id", existingSub.id);

        if (deleteError) {
          console.error(
            `Erro ao remover assinatura antiga ${existingSub.id}: ${deleteError.message}`
          );
        } else {
          console.log(
            `Assinatura antiga ${existingSub.id} removida com sucesso`
          );
        }
      }
    }

    // Preparar os dados para upsert
    const subscriptionUpdateData = {
      subscription_id: subscription.id,
      user_id: userId,
      customer_id: customerId,
      price_id: priceId,
      status: status,
      plan_id: priceId, // Opcionalmente, se você tem um mapeamento diferente para plan_id
      updated_at: new Date().toISOString(),
    };

    // Se temos um ID existente, atualizamos este registro
    if (existingRowId) {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .update(subscriptionUpdateData)
        .eq("id", existingRowId)
        .select()
        .single();

      if (error) {
        console.error(
          `Erro ao atualizar subscription no Supabase: ${error.message}`
        );
      } else {
        console.log(
          `Subscription atualizada com sucesso no Supabase: ${data.subscription_id}`
        );
        console.log(`Status definido como: ${data.status}`);
      }
    } else {
      // Caso contrário, inserimos um novo registro (Supabase gerará um UUID automaticamente)
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .insert(subscriptionUpdateData)
        .select()
        .single();

      if (error) {
        console.error(
          `Erro ao criar subscription no Supabase: ${error.message}`
        );
      } else {
        console.log(
          `Subscription criada com sucesso no Supabase: ${data.subscription_id}`
        );
        console.log(`Status definido como: ${data.status}`);
      }
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error(
      `Erro no processo de atualização da subscription: ${error.message}`
    );
  }
}
