// Configurações do Stripe
export const STRIPE_CONFIG = {
  HD_SWITCH_1TB_PRICE_ID:
    process.env.NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID ||
    "price_1ReNJ6CTgguXlFqcFl0l1rea",
};

// Verificar se as variáveis de ambiente estão configuradas
export const checkStripeConfig = () => {
  console.log("Verificando configuração do Stripe...");
  console.log("Variáveis disponíveis:", {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env
      .NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? "✅ Configurada"
      : "❌ Não configurada",
    NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID: process.env
      .NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID
      ? "✅ Configurada"
      : "❌ Não configurada",
    HD_SWITCH_1TB_PRICE_ID: STRIPE_CONFIG.HD_SWITCH_1TB_PRICE_ID,
  });

  const missingVars = [];

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    missingVars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }

  // Não verificar STRIPE_SECRET_KEY no cliente (é server-side only)

  if (!process.env.NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID) {
    missingVars.push("NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID");
  }

  if (missingVars.length > 0) {
    console.warn(
      "Variáveis de ambiente do Stripe não configuradas:",
      missingVars
    );
    console.log(
      "Usando fallback para HD_SWITCH_1TB_PRICE_ID:",
      STRIPE_CONFIG.HD_SWITCH_1TB_PRICE_ID
    );
    // Retornar true mesmo com fallback para permitir o funcionamento
    return true;
  }

  console.log("✅ Todas as variáveis do Stripe estão configuradas");
  return true;
};
