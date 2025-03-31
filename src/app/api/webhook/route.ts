import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { getUserEmailFromProfile, supabaseAdmin } from "@/lib/supabase-admin";
import {
  addUserPermission,
  removeUserPermission,
} from "@/integrations/google/drive";

/**
 * Tenta obter o email do usuário usando várias estratégias, com foco no login do Google
 * @param userId ID do usuário
 * @param customerId ID do cliente no Stripe
 * @param customerEmail Email do cliente do Stripe (se disponível)
 * @returns Email do usuário ou null se não encontrado
 */
async function getUserEmail(
  userId: string,
  customerId?: string,
  customerEmail?: string | null
): Promise<string | null> {
  const strategies = [
    // Estratégia 1: Auth do Supabase (mais confiável para login do Google)
    async () => {
      try {
        const { data } = await supabase.auth.getUser(userId);
        if (data?.user?.email) {
          console.log(`Email obtido via Supabase Auth: ${data.user.email}`);
          return {
            success: true,
            email: data.user.email,
            source: "Supabase Auth",
          };
        }
      } catch (error) {
        console.error("Erro ao obter email via Supabase Auth:", error);
      }
      return { success: false };
    },

    // Estratégia 2: Admin API do Supabase
    async () => {
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (data?.user?.email) {
          console.log(`Email obtido via Admin API: ${data.user.email}`);
          return { success: true, email: data.user.email, source: "Admin API" };
        }
      } catch (error) {
        console.error("Erro ao obter email via Admin API:", error);
      }
      return { success: false };
    },

    // Estratégia 3: Email do cliente do Stripe
    async () => {
      if (customerEmail) {
        console.log(`Email obtido do Stripe: ${customerEmail}`);
        return {
          success: true,
          email: customerEmail,
          source: "Stripe Customer Email",
        };
      }
      return { success: false };
    },

    // Estratégia 4: Obter do perfil do usuário
    async () => {
      try {
        const profileEmail = await getUserEmailFromProfile(userId);
        if (profileEmail) {
          console.log(`Email obtido do perfil: ${profileEmail}`);
          return { success: true, email: profileEmail, source: "User Profile" };
        }
      } catch (error) {
        console.error("Erro ao obter email do perfil:", error);
      }
      return { success: false };
    },

    // Estratégia 5: Diretamente do Stripe
    async () => {
      if (customerId) {
        try {
          const stripe = getStripe();
          if (stripe) {
            const customer = await stripe.customers.retrieve(customerId);
            if (
              typeof customer !== "string" &&
              !customer.deleted &&
              customer.email
            ) {
              console.log(
                `Email obtido diretamente do Stripe: ${customer.email}`
              );
              return {
                success: true,
                email: customer.email,
                source: "Stripe API",
              };
            }
          }
        } catch (error) {
          console.error("Erro ao obter email do Stripe:", error);
        }
      }
      return { success: false };
    },
  ];

  // Tentar cada estratégia em sequência
  console.log(
    `Tentando obter email para o usuário ${userId} usando ${strategies.length} estratégias`
  );

  for (let i = 0; i < strategies.length; i++) {
    const result = await strategies[i]();
    if (result.success) {
      console.log(`Estratégia ${i + 1} bem-sucedida: ${result.source}`);
      return result.email || null;
    } else {
      console.log(`Estratégia ${i + 1} falhou`);
    }
  }

  console.error(
    `TODAS AS ESTRATÉGIAS FALHARAM para obter email do usuário: ${userId}`
  );
  return null;
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
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { message: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe is not initialized" },
        { status: 500 }
      );
    }

    // Verifica o evento com o Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return NextResponse.json(
        { message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
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
          break;
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
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          price_id: session.metadata?.price_id || "",
          plan_id: "default",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
            const userEmail = await getUserEmail(
              session.client_reference_id,
              session.customer.toString(),
              session.customer_details?.email
            );

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
            return NextResponse.json({ received: true });
          }
        }
        // Estratégia 2: Se não achou pelo subscription_id, procurar pelo customer_id
        else if (subscription.customer) {
          console.log(
            "Tentando encontrar assinatura pelo customer_id:",
            subscription.customer
          );
          const { data: customerData, error: customerError } =
            await supabaseAdmin
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
              return NextResponse.json({ received: true });
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
                  return NextResponse.json({ received: true });
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Função auxiliar para processar o acesso do usuário
async function processUserAccess(
  userId: string,
  customerId: string,
  status: string
) {
  try {
    const userEmail = await getUserEmail(userId, customerId, null);
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
