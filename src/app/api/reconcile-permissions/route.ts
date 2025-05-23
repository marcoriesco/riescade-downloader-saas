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
    // Verificar se a solicitação é da Vercel através de múltiplos métodos
    const isVercelCronHeader = request.headers.get("x-vercel-cron") === "true";
    const userAgent = request.headers.get("user-agent") || "";
    const isVercelCronUserAgent = userAgent.includes("vercel-cron");
    const isVercelCron = isVercelCronHeader || isVercelCronUserAgent;

    // Log específico para identificar solicitações da Vercel
    if (isVercelCron) {
      console.log(
        `Detectada chamada do Cron Job da Vercel - autenticação automática (via ${
          isVercelCronHeader ? "x-vercel-cron header" : "user-agent"
        })`
      );
    } else {
      // Log detalhado de todos os cabeçalhos para depuração
      console.log("=== ANÁLISE DETALHADA DE CABEÇALHOS ===");
      const headers = Array.from(request.headers.entries());
      console.log("Cabeçalhos recebidos:", JSON.stringify(headers, null, 2));

      // Verificar se há outros cabeçalhos que possam identificar a origem Vercel
      const potentialVercelHeaders = headers.filter(
        ([key]) =>
          key.toLowerCase().includes("vercel") ||
          key.toLowerCase().includes("cron") ||
          key.toLowerCase().includes("job")
      );

      if (potentialVercelHeaders.length > 0) {
        console.log(
          "Cabeçalhos potenciais da Vercel:",
          JSON.stringify(potentialVercelHeaders, null, 2)
        );
      }
    }

    const { searchParams } = new URL(request.url);
    let token = searchParams.get("token");
    const expectedToken = process.env.RECONCILIATION_SECRET_TOKEN;

    // Corrigir caso especial onde a Vercel não substitui a variável
    if (
      token &&
      (token === "${RECONCILIATION_SECRET_TOKEN}" ||
        token === '"${RECONCILIATION_SECRET_TOKEN}"')
    ) {
      console.log(
        "Detectada string literal da variável de ambiente em vez do valor. Verificando headers alternativos..."
      );
      // Tentar usar cabeçalho alternativo que pode ter sido definido em uma configuração personalizada
      const altHeader = request.headers.get("x-cron-auth");
      if (altHeader) {
        token = altHeader;
        console.log("Usando token do cabeçalho x-cron-auth como alternativa");
      }
    }

    // Log detalhado para depuração da autenticação
    console.log("Detalhes da requisição de reconciliação:");
    console.log(`- Origem Vercel Cron: ${isVercelCron ? "Sim" : "Não"}`);
    if (isVercelCron) {
      console.log(
        `- Método de detecção: ${
          isVercelCronHeader
            ? "Cabeçalho x-vercel-cron"
            : "User-Agent vercel-cron"
        }`
      );
      console.log(`- User-Agent: ${userAgent}`);
    }
    console.log(`- Token fornecido: ${token ? "Presente" : "Ausente"}`);
    console.log(
      `- Token esperado configurado: ${expectedToken ? "Sim" : "Não"}`
    );

    // Log seguro para comparação de tokens (mostra apenas os primeiros 4 caracteres)
    if (token && expectedToken) {
      const tokenPreview =
        token.substring(0, 4) + "..." + token.substring(token.length - 4);
      const expectedTokenPreview =
        expectedToken.substring(0, 4) +
        "..." +
        expectedToken.substring(expectedToken.length - 4);
      console.log(`- Token fornecido (parcial): ${tokenPreview}`);
      console.log(`- Token esperado (parcial): ${expectedTokenPreview}`);
      console.log(
        `- Os tokens são iguais? ${token === expectedToken ? "Sim" : "Não"}`
      );

      // Se forem diferentes, verificar se há problemas comuns
      if (token !== expectedToken) {
        console.log(
          `- Comprimentos - Fornecido: ${token.length}, Esperado: ${expectedToken.length}`
        );
        if (token.length === expectedToken.length) {
          // Comparar caractere por caractere para encontrar diferenças
          const diffPositions = [];
          for (let i = 0; i < token.length; i++) {
            if (token[i] !== expectedToken[i]) {
              diffPositions.push(i);
            }
          }
          console.log(
            `- Diferenças encontradas em ${diffPositions.length} posições`
          );
        }
      }
    }

    // Verificação de autenticação mais permissiva para facilitar testes
    // Permitir acesso se vier da Vercel OU se o token estiver correto
    let isAuthorized = isVercelCron;

    // Verificar token via query param
    if (!isAuthorized && token && token === expectedToken) {
      isAuthorized = true;
      console.log("Autorizado via token na query string");
    }

    // Verificar token via header x-cron-auth
    if (!isAuthorized) {
      const headerToken = request.headers.get("x-cron-auth");
      if (headerToken && headerToken === expectedToken) {
        isAuthorized = true;
        console.log("Autorizado via header x-cron-auth");
      }
    }

    // Verificar via bypass temporário
    if (!isAuthorized) {
      const bypassCode = searchParams.get("bypass");
      if (bypassCode === "dev-riescade-temp") {
        isAuthorized = true;
        console.log("AVISO: Usando bypass temporário de desenvolvimento!");
      }
    }

    // Se não estiver autorizado, retornar erro
    if (!isAuthorized) {
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
