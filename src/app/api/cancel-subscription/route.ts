import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { subscriptionId, userId } = await request.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(
      `Cancelando assinatura: ${subscriptionId} do usuário: ${userId}`
    );

    // Verificar se a assinatura pertence a este usuário
    const { data: subscriptionData, error: verifyError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, subscription_id, customer_id")
      .eq("subscription_id", subscriptionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (verifyError || !subscriptionData) {
      console.error("Erro ao verificar assinatura:", verifyError);
      return NextResponse.json(
        { message: "Subscription not found or not owned by user" },
        { status: 403 }
      );
    }

    // Inicializar o cliente Stripe
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe client not initialized" },
        { status: 500 }
      );
    }

    let stripeSuccess = false;

    try {
      // Tentar cancelar a assinatura no Stripe
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscriptionId
      );
      console.log(
        "Assinatura cancelada no Stripe:",
        canceledSubscription.status
      );
      stripeSuccess = canceledSubscription.status === "canceled";
    } catch (stripeError: unknown) {
      const errorMessage =
        stripeError instanceof Error
          ? stripeError.message
          : String(stripeError);
      console.error("Erro ao cancelar no Stripe:", errorMessage);

      // Se o erro for porque a assinatura não existe, podemos prosseguir com a atualização no Supabase
      // O importante é que atualizemos o status no banco de dados
      if (
        errorMessage &&
        (errorMessage.includes("No such subscription") ||
          errorMessage.includes("already been canceled"))
      ) {
        console.log(
          "Assinatura já não existe no Stripe ou já foi cancelada, atualizando apenas o Supabase"
        );
        stripeSuccess = true;
      } else {
        return NextResponse.json(
          { message: errorMessage || "Error canceling subscription in Stripe" },
          { status: 500 }
        );
      }
    }

    // Se tivemos sucesso no Stripe ou a assinatura já não existia
    if (stripeSuccess) {
      // Atualizar o status no Supabase
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", subscriptionId);

      if (updateError) {
        console.error("Erro ao atualizar status no Supabase:", updateError);
        // Não retornamos erro aqui porque a assinatura já foi cancelada no Stripe ou não existia
      }

      console.log(
        `Assinatura ${subscriptionId} marcada como cancelada com sucesso`
      );
      return NextResponse.json({
        success: true,
        status: "canceled",
        message: "Assinatura cancelada com sucesso",
      });
    } else {
      console.error("Falha ao cancelar assinatura");
      return NextResponse.json(
        { message: "Failed to cancel subscription" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erro ao cancelar assinatura:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
