import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { addUserPermission } from "@/integrations/google/drive";

// Cliente Supabase com permissões de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    console.log("API: verify-session - Inicializando verificação da sessão");
    const { sessionId, userId } = await request.json();
    console.log("API: verify-session - ID da sessão recebido:", sessionId);
    console.log("API: verify-session - ID do usuário recebido:", userId);

    if (!sessionId) {
      console.log("API: verify-session - Erro: Session ID é obrigatório");
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      console.log("API: verify-session - Erro: User ID é obrigatório");
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      console.log(
        "API: verify-session - Erro: Cliente Stripe não inicializado"
      );
      return NextResponse.json(
        { message: "Stripe client not initialized" },
        { status: 500 }
      );
    }

    // Recuperar a sessão do Stripe
    console.log("API: verify-session - Buscando sessão no Stripe:", sessionId);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "customer"],
      });
      console.log("API: verify-session - Sessão recuperada com sucesso");
    } catch (stripeError) {
      console.error(
        "API: verify-session - Erro ao recuperar sessão do Stripe:",
        stripeError
      );
      return NextResponse.json(
        { message: "Failed to retrieve Stripe session" },
        { status: 404 }
      );
    }

    if (!session || session.status !== "complete") {
      console.log(
        "API: verify-session - Erro: Sessão não completa ou inválida:",
        session?.status
      );
      return NextResponse.json(
        { message: "Session not complete" },
        { status: 400 }
      );
    }

    // Verificar se temos acesso à assinatura e ao cliente
    console.log("API: verify-session - Verificando dados da sessão");
    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;

    console.log("API: verify-session - Dados da sessão:", {
      subscriptionId: subscription?.id,
      customerId: customer?.id,
      userId: userId,
      sessionStatus: session.status,
    });

    if (!subscription) {
      console.log(
        "API: verify-session - Erro: Dados da assinatura incompletos"
      );
      return NextResponse.json(
        { message: "Missing subscription information" },
        { status: 400 }
      );
    }

    // Verificar se já existe uma assinatura para este usuário
    console.log(
      "API: verify-session - Verificando se o usuário já tem assinatura no Supabase"
    );
    const { data: existingUserSubscription, error: userSubError } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (userSubError) {
      console.error(
        "API: verify-session - Erro ao verificar assinatura existente do usuário:",
        userSubError
      );
    }

    // Verificar se a assinatura específica do Stripe existe (apenas para logging)
    console.log(
      `API: verify-session - Verificando se subscription_id ${subscription.id} existe no Supabase`
    );
    const { error: stripeSubError } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("subscription_id", subscription.id)
      .maybeSingle();

    if (stripeSubError) {
      console.error(
        "API: verify-session - Erro ao verificar assinatura do Stripe:",
        stripeSubError
      );
    }

    // Extrair detalhes da assinatura para o Supabase
    let priceId = null;
    let planId = null;

    try {
      if (subscription.items.data.length > 0) {
        const item = subscription.items.data[0];
        priceId = item.price.id;
        planId = item.plan?.id || item.price.id;
      }
      console.log("API: verify-session - Detalhes do plano:", {
        priceId,
        planId,
      });
    } catch (error) {
      console.error(
        "API: verify-session - Erro ao extrair detalhes do plano:",
        error
      );
      // Não lançar exceção, apenas continuar com valores nulos
    }

    // Preparar dados para salvar no Supabase
    const subscriptionData = {
      user_id: userId,
      subscription_id: subscription.id,
      customer_id: customer.id,
      status: subscription.status,
      price_id: priceId,
      plan_id: planId,
      start_date: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    };

    // Lógica de atualização baseada nas verificações prévias
    let error;

    if (existingUserSubscription) {
      console.log(
        "API: verify-session - Usuário já possui assinatura, atualizando:",
        existingUserSubscription.id
      );

      // Se o usuário já tem uma assinatura, atualize-a
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update(subscriptionData)
        .eq("id", existingUserSubscription.id);

      error = updateError;
    } else {
      console.log(
        "API: verify-session - Criando nova assinatura para o usuário"
      );

      // Se não houver assinatura para este usuário, crie uma nova
      // Adicione o campo created_at para novos registros
      const subscriptionDataWithCreatedAt = {
        ...subscriptionData,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .insert(subscriptionDataWithCreatedAt);

      error = insertError;
    }

    if (error) {
      console.error("API: verify-session - Erro ao salvar no Supabase:", error);
      return NextResponse.json(
        { message: `Failed to save subscription: ${error.message}` },
        { status: 500 }
      );
    }

    // Adicionar permissão no Google Drive após verificar assinatura
    try {
      // Obter email do usuário diretamente do Supabase Auth
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(userId);

      if (userError || !userData?.user?.email) {
        console.error(
          "API: verify-session - Erro ao obter email do usuário:",
          userError
        );
      } else {
        const userEmail = userData.user.email;
        console.log(
          `API: verify-session - Adicionando permissão no Google Drive para ${userEmail}`
        );

        // Verificar se as variáveis de ambiente estão configuradas
        if (
          !process.env.GOOGLE_DRIVE_FOLDER_ID ||
          !process.env.GOOGLE_CLIENT_EMAIL ||
          !process.env.GOOGLE_PRIVATE_KEY
        ) {
          console.error(
            "API: verify-session - Configurações do Google Drive incompletas"
          );
        } else {
          // Adicionar permissão no Google Drive
          const result = await addUserPermission(userEmail);
          console.log(
            "API: verify-session - Resultado da adição de permissão:",
            result
          );
        }
      }
    } catch (driveError) {
      console.error(
        "API: verify-session - Erro ao gerenciar permissões do Drive:",
        driveError
      );
      // Não falhar a resposta por causa desse erro
    }

    console.log(
      "API: verify-session - Assinatura salva com sucesso no Supabase"
    );
    return NextResponse.json({
      success: true,
      status: subscription.status,
      currentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    });
  } catch (error: unknown) {
    console.error("API: verify-session - Erro não tratado:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
