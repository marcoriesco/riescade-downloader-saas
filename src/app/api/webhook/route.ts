/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  addUserPermission,
  removeUserPermission,
} from "@/integrations/google/drive";

// Desativar o bodyParser do Next.js para webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

// Requisições dinâmicas e não cacheadas
export const dynamic = "force-dynamic";

/**
 * Obtém o email do usuário para gerenciar permissões no Google Drive
 * Simplificado para usar diretamente o email da autenticação, já que o login é sempre pelo Google
 *
 * @param userId ID do usuário no Supabase
 * @returns Email do usuário ou null se não encontrado
 */
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    // Obter dados do usuário diretamente do Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      console.error("Erro ao obter usuário via Admin API:", error);
      return null;
    }

    if (data?.user?.email) {
      console.log(`Email obtido da autenticação: ${data.user.email}`);
      return data.user.email;
    }

    console.error("Email não encontrado para o usuário:", userId);
    return null;
  } catch (error) {
    console.error("Erro ao obter email do usuário:", error);
    return null;
  }
}

/**
 * Gerencia as permissões do Drive de acordo com o status da assinatura
 * @param userId ID do usuário
 * @param userEmail Email do usuário
 * @param status Status da assinatura
 */
async function manageGoogleDriveAccess(
  userId: string,
  userEmail: string,
  status: string
) {
  try {
    console.log(
      `Gerenciando acesso no Drive para usuário ${userEmail} com status: ${status}`
    );

    // Verificar se as variáveis de ambiente do Google Drive estão configuradas
    if (
      !process.env.GOOGLE_DRIVE_FOLDER_ID ||
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      console.error(
        "Configurações do Google Drive incompletas. Verificar variáveis de ambiente."
      );
      return;
    }

    // Se a assinatura está ativa, conceder acesso
    if (status === "active") {
      console.log(`Adicionando acesso no Drive para ${userEmail}`);
      try {
        const result = await addUserPermission(userEmail);
        console.log("Resultado da adição de permissão:", result);
      } catch (driveError) {
        console.error(
          `Erro ao adicionar permissão no Drive para ${userEmail}:`,
          driveError
        );
      }
    }
    // Se a assinatura não estiver ativa, remover acesso
    else {
      console.log(`Removendo acesso no Drive para ${userEmail}`);
      try {
        const result = await removeUserPermission(userEmail);
        console.log("Resultado da remoção de permissão:", result);
      } catch (driveError) {
        console.error(
          `Erro ao remover permissão no Drive para ${userEmail}:`,
          driveError
        );
      }
    }
  } catch (error) {
    console.error(
      `Erro ao gerenciar acesso no Google Drive para ${userEmail}:`,
      error
    );
  }
}

export async function POST(request: Request) {
  console.log("[Webhook] Webhook do Stripe recebido");

  // 1. Primeiro, obtenha os dados da requisição
  const signature = request.headers.get("stripe-signature");

  // Receber o corpo da requisição sem processamento pelo Next.js
  let body = "";
  try {
    body = await request.text();
    console.log(`[Webhook] Tamanho do corpo: ${body.length} bytes`);
  } catch (error) {
    console.error("[Webhook] Erro ao ler o corpo da requisição:", error);
    return processUnverifiedEvent(body, "Erro ao ler corpo da requisição");
  }

  // 2. Tente verificar o evento, mas processe mesmo que falhe
  let event = null;

  // Verificar se temos o que é necessário
  if (!signature) {
    console.error("[Webhook] Assinatura não encontrada no cabeçalho");
    return processUnverifiedEvent(body, "Assinatura não encontrada");
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[Webhook] Segredo do webhook não configurado");
    return processUnverifiedEvent(body, "Segredo do webhook não configurado");
  }

  // Inicializar o Stripe
  const stripe = getStripe();
  if (!stripe) {
    console.error("[Webhook] Cliente Stripe não inicializado");
    return processUnverifiedEvent(body, "Cliente Stripe não inicializado");
  }

  // Tentar verificar a assinatura
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`[Webhook] Evento verificado com sucesso: ${event.type}`);
  } catch (error) {
    console.error(
      "[Webhook] Erro na verificação do webhook:",
      error instanceof Error ? error.message : error
    );

    // Tentar extrair o evento do corpo mesmo sem verificação
    try {
      const jsonBody = JSON.parse(body);
      if (jsonBody.type && jsonBody.data && jsonBody.data.object) {
        console.log(
          `[Webhook] Recuperado tipo de evento não verificado: ${jsonBody.type}`
        );
        return processUnverifiedEvent(
          body,
          "Falha na verificação da assinatura"
        );
      }
    } catch (jsonError) {
      console.error("[Webhook] O corpo não é um JSON válido:", jsonError);
      return NextResponse.json({
        received: true,
        error: "Corpo inválido e assinatura inválida",
      });
    }
  }

  // 3. Se chegamos aqui e temos um evento verificado, processá-lo
  if (event) {
    try {
      await processStripeEvent(event);
    } catch (processError) {
      console.error(
        "[Webhook] Erro ao processar evento verificado:",
        processError
      );
    }
  }

  // 4. Sempre retornar sucesso para evitar tentativas repetidas
  return NextResponse.json({ received: true });
}

/**
 * Processa um evento não verificado, extraindo os dados diretamente do JSON
 */
async function processUnverifiedEvent(bodyText: string, reason: string) {
  try {
    // Extrair o JSON do corpo
    const body = JSON.parse(bodyText);
    console.log(
      `[Webhook] Processando evento não verificado: ${body.type} (Razão: ${reason})`
    );

    // Se for um evento de subscription.updated, tratar manualmente
    if (
      body.type === "customer.subscription.updated" &&
      body.data?.object?.customer
    ) {
      const subscription = body.data.object;
      const status = subscription.status;
      const subscriptionId = subscription.id;

      console.log(
        `[Webhook] Processando atualização de assinatura não verificada: ${subscriptionId} - Status: ${status}`
      );

      // Verificar se a assinatura existe no banco de dados
      try {
        const { data } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("subscription_id", subscriptionId)
          .single();

        if (data && data.user_id) {
          // Atualizar o status da assinatura
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status,
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", subscriptionId);

          console.log(
            `[Webhook] Assinatura ${subscriptionId} atualizada para ${status}`
          );

          // Obter o email do usuário
          const userEmail = await getUserEmail(data.user_id);
          if (userEmail) {
            // Gerenciar acesso ao Drive
            await manageGoogleDriveAccess(data.user_id, userEmail, status);
          }
        } else {
          console.log(
            `[Webhook] Assinatura ${subscriptionId} não encontrada no banco de dados`
          );
        }
      } catch (dbError) {
        console.error(
          "[Webhook] Erro ao processar evento não verificado no banco de dados:",
          dbError
        );
      }
    }

    // Sempre retornar sucesso
    return NextResponse.json({
      received: true,
      verified: false,
      reason,
    });
  } catch (error) {
    console.error("[Webhook] Erro ao processar evento não verificado:", error);
    return NextResponse.json({
      received: true,
      verified: false,
      error: "Erro ao processar evento não verificado",
    });
  }
}

/**
 * Processa eventos do Stripe e lida com exceções internamente
 * para não propagar erros de volta para o Stripe
 */
async function processStripeEvent(event: {
  type: string;
  data: { object: any };
}) {
  const stripe = getStripe();
  if (!stripe) {
    console.error("Stripe não inicializado no processamento de eventos");
    return;
  }

  // Processa diferentes tipos de eventos
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout session completed:", session);

      // Verifica se temos todos os dados necessários
      if (
        !session.customer ||
        !session.subscription ||
        !session.client_reference_id
      ) {
        console.error("Dados incompletos na sessão de checkout:", {
          customer: !!session.customer,
          subscription: !!session.subscription,
          client_reference_id: !!session.client_reference_id,
        });
        return; // Retornamos sem erro para não interromper o fluxo
      }

      console.log("Processando checkout concluído para:", {
        user_id: session.client_reference_id,
        customer_id: session.customer,
        subscription_id: session.subscription,
      });

      // Atualiza o banco de dados
      const { error } = await supabase.from("subscriptions").upsert({
        user_id: session.client_reference_id,
        subscription_id: session.subscription,
        customer_id: session.customer,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        price_id: session.metadata?.price_id || "",
        plan_id: "default",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_provider: "stripe",
      });

      if (error) {
        console.error("Error updating subscription:", error);
      } else {
        // Se temos nome completo nos metadados, atualize o cliente Stripe
        if (session.metadata?.fullName) {
          try {
            await stripe.customers.update(session.customer.toString(), {
              name: session.metadata.fullName,
              metadata: {
                fullName: session.metadata.fullName,
              },
            });
            console.log(
              `Nome do cliente atualizado: ${session.metadata.fullName}`
            );
          } catch (updateError) {
            console.error("Erro ao atualizar nome do cliente:", updateError);
          }
        }

        // Obter o email do usuário para gerenciar permissões no Drive
        try {
          const userEmail = await getUserEmail(session.client_reference_id);

          if (userEmail) {
            await manageGoogleDriveAccess(
              session.client_reference_id,
              userEmail,
              "active"
            );
          } else {
            console.error(
              "Não foi possível obter o email do usuário para gerenciar acesso ao Drive"
            );
          }
        } catch (emailError) {
          console.error("Erro ao obter email do usuário:", emailError);
        }
      }
      break;

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object;
      const status = subscription.status;
      console.log(
        `Evento de subscription ${event.type} recebido:`,
        subscription.id,
        status
      );

      // Tentativa de atualização com supabaseAdmin - maior privilégio
      console.log("Tentando verificar a assinatura com supabaseAdmin");
      const { data: adminCheckData, error: adminCheckError } =
        await supabaseAdmin
          .from("subscriptions")
          .select("subscription_id, user_id, customer_id, status")
          .eq("subscription_id", subscription.id);

      if (adminCheckError) {
        console.error(
          "Erro ao verificar existência da assinatura com Admin:",
          adminCheckError
        );
      } else {
        console.log("Resultado da verificação com Admin:", adminCheckData);
      }

      let userIdToUpdate = null;
      let customerIdToUse = null;

      // Estratégia 1: Encontrar pelo subscription_id
      if (adminCheckData && adminCheckData.length > 0) {
        console.log("Assinatura encontrada pelo subscription_id");
        userIdToUpdate = adminCheckData[0].user_id;
        customerIdToUse = adminCheckData[0].customer_id;

        // Atualizar diretamente
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscription.id);

        if (updateError) {
          console.error("Erro ao atualizar assinatura:", updateError);
        } else {
          console.log(
            `Assinatura ${subscription.id} atualizada com sucesso para ${status}`
          );

          // Gerenciar acesso ao Drive
          await processUserAccess(userIdToUpdate, customerIdToUse, status);
          return;
        }
      }
      // Estratégia 2: Se não achou pelo subscription_id, procurar pelo customer_id
      else if (subscription.customer) {
        console.log(
          "Tentando encontrar assinatura pelo customer_id:",
          subscription.customer
        );
        const { data: customerData, error: customerError } = await supabaseAdmin
          .from("subscriptions")
          .select("subscription_id, user_id, customer_id")
          .eq("customer_id", subscription.customer);

        if (customerError) {
          console.error("Erro ao buscar pelo customer_id:", customerError);
        } else if (customerData && customerData.length > 0) {
          console.log(
            "Assinatura encontrada pelo customer_id:",
            customerData[0]
          );
          userIdToUpdate = customerData[0].user_id;
          customerIdToUse = customerData[0].customer_id;

          // Atualizar todas as assinaturas deste customer
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status,
              subscription_id: subscription.id, // Atualiza o subscription_id para manter sincronizado
              updated_at: new Date().toISOString(),
            })
            .eq("customer_id", subscription.customer);

          if (updateError) {
            console.error(
              "Erro ao atualizar assinatura pelo customer_id:",
              updateError
            );
          } else {
            console.log(
              `Assinaturas do customer ${subscription.customer} atualizadas para ${status}`
            );

            // Gerenciar acesso ao Drive
            await processUserAccess(userIdToUpdate, customerIdToUse, status);
            return;
          }
        } else {
          console.log("Nenhuma assinatura encontrada para este customer");

          // Estratégia 3: Como último recurso, verificar diretamente na tabela 'users' do Supabase
          try {
            const { data: usersData, error: usersError } = await supabaseAdmin
              .from("users") // Ou a tabela que você utiliza para usuários
              .select("id, email")
              .eq("stripe_customer_id", subscription.customer)
              .single();

            if (!usersError && usersData) {
              console.log(
                "Usuário encontrado pelo customer_id na tabela users:",
                usersData
              );

              // Criar uma entrada nova de assinatura
              const { error: insertError } = await supabaseAdmin
                .from("subscriptions")
                .insert({
                  user_id: usersData.id,
                  customer_id: subscription.customer,
                  subscription_id: subscription.id,
                  status: status,
                  updated_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  payment_provider: "stripe",
                });

              if (insertError) {
                console.error("Erro ao criar nova assinatura:", insertError);
              } else {
                console.log(
                  "Nova assinatura criada para o usuário:",
                  usersData.id
                );

                // Gerenciar acesso ao Drive
                if (usersData.email) {
                  await manageGoogleDriveAccess(
                    usersData.id,
                    usersData.email,
                    status
                  );
                }
                return;
              }
            } else {
              console.log(
                "Usuário não encontrado na tabela users:",
                usersError
              );
            }
          } catch (error) {
            console.error("Erro ao consultar tabela de usuários:", error);
          }
        }
      }

      console.log(
        "Não foi possível atualizar a assinatura por nenhum método conhecido"
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

// Função auxiliar para processar o acesso do usuário
async function processUserAccess(
  userId: string,
  customerId: string,
  status: string
) {
  try {
    const userEmail = await getUserEmail(userId);
    if (userEmail) {
      await manageGoogleDriveAccess(userId, userEmail, status);
    } else {
      console.error(
        "Não foi possível obter o email do usuário para gerenciar acesso ao Drive"
      );
    }
  } catch (emailError) {
    console.error("Erro ao gerenciar acesso do usuário:", emailError);
  }
}
