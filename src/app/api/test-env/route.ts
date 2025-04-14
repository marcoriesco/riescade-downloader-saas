import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar apenas se a variável existe, sem exibir o valor completo
    const hasHotmartSecret = !!process.env.HOTMART_WEBHOOK_SECRET;
    const secretFirstChars = process.env.HOTMART_WEBHOOK_SECRET
      ? process.env.HOTMART_WEBHOOK_SECRET.substring(0, 5) + "..."
      : null;

    // Informações para debug
    const envInfo = {
      has_hotmart_secret: hasHotmartSecret,
      secret_prefix: secretFirstChars,
      node_env: process.env.NODE_ENV,
      next_runtime: process.env.NEXT_RUNTIME,
    };

    return NextResponse.json({
      success: true,
      env_info: envInfo,
    });
  } catch (error) {
    console.error("Erro ao verificar variáveis de ambiente:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao verificar variáveis de ambiente" },
      { status: 500 }
    );
  }
}
