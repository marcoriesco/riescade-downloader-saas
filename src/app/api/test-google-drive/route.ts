import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    console.log("Testando credenciais Google Drive");
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        project_id: process.env.GOOGLE_PROJECT_ID || "default-project",
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Tenta uma operação simples como listar arquivos
    const response = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name)",
    });

    return NextResponse.json({
      success: true,
      message: "Credenciais funcionando corretamente",
      files: response.data.files,
    });
  } catch (error: unknown) {
    console.error("Erro ao testar credenciais Google:", error);

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
