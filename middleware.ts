import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificar se é uma requisição para o webhook do Stripe
  if (request.nextUrl.pathname === "/api/webhook") {
    // Desativar o body parsing para rotas de webhook
    // Isso garante que o corpo da requisição chegue intacto na função da API
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Para outras rotas, apenas continue normalmente
  return NextResponse.next();
}

// Configuração do middleware para que ele se aplique apenas à rota de webhook
export const config = {
  matcher: "/api/webhook",
};
