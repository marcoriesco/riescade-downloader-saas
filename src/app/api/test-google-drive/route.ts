// app/api/test-drive-permission/route.ts
import { NextResponse } from "next/server";
import { addUserPermission } from "@/integrations/google/drive";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "sharkdev.com.br@gmail.com";

  try {
    console.log(`Testando adição de permissão para: ${email}`);
    const result = await addUserPermission(email);
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error(`Erro ao adicionar permissão para ${email}:`, error);

    // Tratamento adequado para o tipo unknown
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
