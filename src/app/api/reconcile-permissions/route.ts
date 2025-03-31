import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  addUserPermission,
  hasUserPermission,
} from "@/integrations/google/drive";

/**
 * Endpoint para reconciliar assinaturas ativas com permissões no Google Drive
 * Configurado para ser executado como Vercel Cron Job
 */
export async function GET(request: Request) {
  // Verificar se é uma requisição de teste
  const { searchParams } = new URL(request.url);
  const isTest = searchParams.get("test") === "true";

  if (isTest) {
    // Endpoint de teste sem autenticação - use apenas durante desenvolvimento
    return NextResponse.json({
      message: "API de reconciliação está funcionando",
      env_check: {
        reconciliation_token_set: !!process.env.RECONCILIATION_SECRET_TOKEN,
        google_drive_folder_set: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
        google_credentials_set: !!(
          process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
        ),
      },
    });
  }

  return handleReconciliation(request);
}

export async function POST(request: Request) {
  return handleReconciliation(request);
}

async function handleReconciliation(request: Request) {
  try {
    // Verificar se a solicitação é da Vercel ou tem token válido
    const isVercelCron = request.headers.get("x-vercel-cron") === "true";
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const expectedToken = process.env.RECONCILIATION_SECRET_TOKEN;

    // Log detalhado para depuração da autenticação
    console.log("Detalhes da requisição de reconciliação:");
    console.log(`- Origem Vercel Cron: ${isVercelCron ? "Sim" : "Não"}`);
    console.log(`- Token fornecido: ${token ? "Presente" : "Ausente"}`);
    console.log(
      `- Token esperado configurado: ${expectedToken ? "Sim" : "Não"}`
    );

    // Verificação de autenticação mais permissiva para facilitar testes
    if (!isVercelCron && (!token || token !== expectedToken)) {
      console.log(
        "Tentativa de acesso não autorizado ao endpoint de reconciliação"
      );
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: "Verifique o token ou cabeçalho x-vercel-cron",
        },
        { status: 401 }
      );
    }

    // Token válido ou requisição da Vercel, prosseguir com reconciliação
    console.log("Autenticação bem-sucedida para o endpoint de reconciliação");

    // Verificar se as variáveis de ambiente do Google Drive estão configuradas
    if (
      !process.env.GOOGLE_DRIVE_FOLDER_ID ||
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      console.error("Variáveis de ambiente do Google Drive não configuradas");
      return NextResponse.json(
        { error: "Google Drive environment variables not set" },
        { status: 500 }
      );
    }

    // Buscar todas as assinaturas ativas
    const { data: activeSubscriptions, error: subscriptionsError } =
      await supabaseAdmin
        .from("subscriptions")
        .select("user_id, customer_id")
        .eq("status", "active");

    if (subscriptionsError) {
      console.error("Erro ao buscar assinaturas ativas:", subscriptionsError);
      return NextResponse.json(
        { error: "Failed to fetch active subscriptions" },
        { status: 500 }
      );
    }

    console.log(
      `Encontradas ${activeSubscriptions.length} assinaturas ativas para reconciliar`
    );

    // Resultados para relatório
    const results = {
      total: activeSubscriptions.length,
      processed: 0,
      added: 0,
      alreadyExisted: 0,
      failed: 0,
      failedDetails: [] as string[],
    };

    // Processar cada assinatura ativa
    for (const subscription of activeSubscriptions) {
      try {
        results.processed++;

        // Buscar detalhes do usuário para obter o email
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(subscription.user_id);

        if (userError || !userData?.user?.email) {
          console.error(
            `Não foi possível obter email para o usuário ${subscription.user_id}:`,
            userError
          );
          results.failed++;
          results.failedDetails.push(
            `User ${subscription.user_id}: Email not found`
          );
          continue;
        }

        const userEmail = userData.user.email;

        // Verificar se o usuário já tem permissão
        const hasPermission = await hasUserPermission(userEmail);

        if (hasPermission) {
          console.log(`Usuário ${userEmail} já possui permissão no Drive`);
          results.alreadyExisted++;
        } else {
          // Adicionar permissão
          console.log(`Adicionando permissão para ${userEmail}`);
          const result = await addUserPermission(userEmail);

          if (result.success) {
            console.log(`Permissão adicionada com sucesso para ${userEmail}`);
            results.added++;
          } else {
            console.error(
              `Falha ao adicionar permissão para ${userEmail}:`,
              result.error
            );
            results.failed++;
            results.failedDetails.push(`User ${userEmail}: ${result.error}`);
          }
        }
      } catch (error) {
        console.error(
          `Erro ao processar usuário ${subscription.user_id}:`,
          error
        );
        results.failed++;
        results.failedDetails.push(
          `User ${subscription.user_id}: Unexpected error`
        );
      }
    }

    return NextResponse.json({
      message: "Reconciliation completed",
      results,
    });
  } catch (error) {
    console.error("Erro na reconciliação de permissões:", error);
    return NextResponse.json(
      { error: "Reconciliation failed" },
      { status: 500 }
    );
  }
}
