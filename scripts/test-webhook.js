import { exec } from "child_process";
import path from "path";

console.log("🚀 Iniciando teste do webhook Stripe...\n");

// Verificar se o Stripe CLI está instalado
exec("stripe --version", (error, stdout) => {
  if (error) {
    console.log("❌ Stripe CLI não encontrado. Instalando...");
    exec("npm install -g stripe", (installError) => {
      if (installError) {
        console.log("❌ Erro ao instalar Stripe CLI:", installError.message);
        return;
      }
      console.log("✅ Stripe CLI instalado com sucesso!");
      startWebhookListener();
    });
  } else {
    console.log("✅ Stripe CLI já instalado:", stdout.trim());
    startWebhookListener();
  }
});

function startWebhookListener() {
  console.log("\n📡 Iniciando listener de webhooks...");
  console.log("🔗 URL: http://localhost:3001/api/webhooks/stripe");
  console.log(
    "📋 Copie o webhook secret que aparecer abaixo e adicione ao .env.local\n"
  );

  const stripeProcess = exec(
    "stripe listen --forward-to localhost:3001/api/webhooks/stripe",
    {
      cwd: path.join(__dirname, ".."),
    }
  );

  stripeProcess.stdout.on("data", (data) => {
    console.log(data);

    // Detectar quando o webhook secret é gerado
    if (data.includes("whsec_")) {
      console.log("\n🎯 WEBHOOK SECRET GERADO!");
      console.log("📝 Adicione ao seu arquivo .env.local:");
      console.log(
        "STRIPE_WEBHOOK_SECRET=" + data.match(/whsec_[a-zA-Z0-9]+/)[0]
      );
      console.log("\n✅ Agora você pode testar uma compra!");
    }
  });

  stripeProcess.stderr.on("data", (data) => {
    console.error("❌ Erro:", data);
  });

  stripeProcess.on("close", (code) => {
    console.log(`\n🔚 Processo finalizado com código: ${code}`);
  });

  // Permitir parar o processo com Ctrl+C
  process.on("SIGINT", () => {
    console.log("\n🛑 Parando listener de webhooks...");
    stripeProcess.kill();
    process.exit();
  });
}
