import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  addUserPermission,
  removeUserPermission,
} from "@/integrations/google/drive";

/**
 * Interface for Hotmart webhook payload
 * Documentation: https://developers.hotmart.com/docs/en/webhooks/
 */
interface HotmartWebhookPayload {
  id: string;
  event: string;
  data: {
    purchase: {
      transaction: string;
      order_date: string;
      status: string;
      payment: {
        type: string;
        method: string;
        installments_number: number;
      };
      price: {
        value: number;
        currency_code: string;
      };
    };
    product: {
      id: string;
      name: string;
    };
    subscription?: {
      status: string;
      subscriber: {
        code: string;
      };
      plan: {
        name: string;
      };
      recurrence_number?: number;
    };
    buyer: {
      email: string;
      name: string;
    };
    commissions?: Array<{
      value: number;
      source: string;
    }>;
  };
}

/**
 * Maps Hotmart subscription status to our internal status
 */
function mapHotmartStatus(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: "active",
    CANCELLED: "canceled",
    INACTIVE: "inactive",
    DELAYED: "past_due",
    STARTED: "active",
    OVERDUE: "past_due",
    FINISHED: "canceled",
  };

  return statusMap[status] || status.toLowerCase();
}

/**
 * Manages Google Drive access based on subscription status
 */
async function manageGoogleDriveAccess(
  userId: string,
  userEmail: string,
  subscriptionStatus: string
) {
  try {
    // Add permissions for active subscriptions, remove for others
    if (subscriptionStatus === "active") {
      console.log(`Adicionando permissão de Drive para: ${userEmail}`);
      await addUserPermission(userEmail);
    } else {
      console.log(`Removendo permissão de Drive para: ${userEmail}`);
      await removeUserPermission(userEmail);
    }
  } catch (error) {
    console.error("Erro ao gerenciar permissões do Drive:", error);
  }
}

/**
 * Finds a user by email in Supabase
 */
async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Erro ao listar usuários:", error);
    return null;
  }

  const user = data.users.find((u) => u.email === email);
  return user || null;
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação (usando um header simples, pode ser melhorado com HMAC)
    const authToken = request.headers.get("hotmart-auth-token");

    console.log(
      "HEADERS RECEBIDOS:",
      Object.fromEntries([...request.headers.entries()])
    );
    console.log("AUTH TOKEN:", authToken);
    console.log("SECRET ESPERADO:", process.env.HOTMART_WEBHOOK_SECRET);

    // TEMPORÁRIO: Permitir testes locais/iniciais sem autenticação
    const isTestMode = process.env.NODE_ENV !== "production";

    if (
      !isTestMode &&
      (!authToken || authToken !== process.env.HOTMART_WEBHOOK_SECRET)
    ) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Parse do payload
    const body = (await request.json()) as HotmartWebhookPayload;
    const event = body.event;

    console.log(`Evento recebido do Hotmart: ${event}`, body);

    // Processar eventos com base no tipo
    switch (event) {
      case "PURCHASE_APPROVED":
      case "PURCHASE_COMPLETE":
      case "SUBSCRIPTION_REACTIVATED":
      case "SUBSCRIPTION_RENEWED":
        await handleSubscriptionActive(body);
        break;

      case "SUBSCRIPTION_CANCELLED":
      case "PURCHASE_CANCELED":
      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK":
      case "PURCHASE_DELAYED":
      case "SUBSCRIPTION_DELAYED":
      case "SUBSCRIPTION_OVERDUE":
        await handleSubscriptionInactive(body);
        break;

      default:
        console.log(`Evento não processado: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Hotmart:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}

/**
 * Handles events for active or renewed subscriptions
 */
async function handleSubscriptionActive(payload: HotmartWebhookPayload) {
  const { buyer, product, purchase, subscription } = payload.data;

  // Encontrar o usuário pelo email
  const user = await findUserByEmail(buyer.email);

  if (!user) {
    console.error(`Usuário não encontrado para o email: ${buyer.email}`);
    return;
  }

  const userId = user.id;
  const status = subscription
    ? mapHotmartStatus(subscription.status)
    : "active";
  const hotmartTransactionId = purchase.transaction;

  // Verificar se já existe registro de assinatura
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("subscription_id", hotmartTransactionId)
    .maybeSingle();

  // Preparar dados da assinatura
  const subscriptionData = {
    user_id: userId,
    subscription_id: hotmartTransactionId,
    customer_id: buyer.email, // Usando email como identificador
    status: status,
    price_id: product.id.toString(),
    plan_id: subscription?.plan.name || product.name,
    start_date: new Date(purchase.order_date).toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias por padrão
    updated_at: new Date().toISOString(),
    payment_provider: "hotmart", // Adicionando o provedor de pagamento
  };

  // Inserir ou atualizar assinatura
  if (existingSubscription) {
    const { error } = await supabase
      .from("subscriptions")
      .update(subscriptionData)
      .eq("id", existingSubscription.id);

    if (error) {
      console.error("Erro ao atualizar assinatura:", error);
    } else {
      console.log(`Assinatura atualizada para ${userId}`);
    }
  } else {
    // Adicionar created_at para novos registros
    const newSubscriptionData = {
      ...subscriptionData,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("subscriptions")
      .insert(newSubscriptionData);

    if (error) {
      console.error("Erro ao criar assinatura:", error);
    } else {
      console.log(`Nova assinatura criada para ${userId}`);
    }
  }

  // Gerenciar permissões do Google Drive
  await manageGoogleDriveAccess(userId, buyer.email, status);
}

/**
 * Handles events for canceled or inactive subscriptions
 */
async function handleSubscriptionInactive(payload: HotmartWebhookPayload) {
  const { buyer, purchase } = payload.data;
  const hotmartTransactionId = purchase.transaction;

  // Encontrar o usuário pelo email
  const user = await findUserByEmail(buyer.email);

  if (!user) {
    console.error(`Usuário não encontrado para o email: ${buyer.email}`);
    return;
  }

  const userId = user.id;
  const status = payload.data.subscription
    ? mapHotmartStatus(payload.data.subscription.status)
    : "canceled";

  // Verificar se existe assinatura
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("subscription_id", hotmartTransactionId)
    .maybeSingle();

  if (existingSubscription) {
    // Atualizar status da assinatura
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSubscription.id);

    if (error) {
      console.error("Erro ao atualizar status da assinatura:", error);
    } else {
      console.log(`Status da assinatura atualizado para ${status}`);
    }

    // Gerenciar permissões do Google Drive
    await manageGoogleDriveAccess(userId, buyer.email, status);
  } else {
    console.log(
      `Nenhuma assinatura encontrada para o usuário ${userId} com ID de transação ${hotmartTransactionId}`
    );
  }
}
