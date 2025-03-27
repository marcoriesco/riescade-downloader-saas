// app/api/test-webhook-flow/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  addUserPermission,
  removeUserPermission,
} from "@/integrations/google/drive";

// Clone simplificado da função do webhook
async function getUserEmail(
  userId: string,
  email?: string | null
): Promise<string | null> {
  // Versão simplificada para teste
  if (email) return email;

  try {
    const { data } = await supabase.auth.getUser(userId);
    return data?.user?.email || null;
  } catch (error) {
    console.error("Erro ao obter email:", error);
    return null;
  }
}

async function manageGoogleDriveAccess(
  userId: string,
  userEmail: string,
  status: string
) {
  try {
    console.log(
      `Testando gerenciamento de Drive para ${userEmail} com status: ${status}`
    );

    // Verificar variáveis de ambiente
    if (
      !process.env.GOOGLE_DRIVE_FOLDER_ID ||
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      return {
        success: false,
        error: "Configurações do Google Drive incompletas",
      };
    }

    // Adicionar permissão
    if (status === "active") {
      console.log(`Adicionando acesso para ${userEmail}`);
      const result = await addUserPermission(userEmail);
      return { success: true, action: "add", result };
    } else {
      console.log(`Removendo acesso para ${userEmail}`);
      const result = await removeUserPermission(userEmail);
      return { success: true, action: "remove", result };
    }
  } catch (error) {
    console.error(`Erro ao gerenciar acesso:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const email = searchParams.get("email");
  const status = searchParams.get("status") || "active";

  if (!userId && !email) {
    return NextResponse.json(
      { error: "Forneça userId ou email como parâmetro" },
      { status: 400 }
    );
  }

  try {
    // Obter email se não foi fornecido
    const userEmail = email || (await getUserEmail(userId));

    if (!userEmail) {
      return NextResponse.json(
        { error: "Não foi possível obter o email do usuário" },
        { status: 400 }
      );
    }

    // Testar gerenciamento de acesso
    const result = await manageGoogleDriveAccess(userId, userEmail, status);

    return NextResponse.json({
      success: true,
      userId,
      email: userEmail,
      status,
      result,
    });
  } catch (error: unknown) {
    console.error("Erro no teste:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
