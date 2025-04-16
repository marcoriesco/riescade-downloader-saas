import { NextResponse } from "next/server";
import publishScheduledPosts from "../../../scripts/publish-from-posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Executar a publicação
    await publishScheduledPosts();

    return NextResponse.json({
      success: true,
      message: "Publicação executada com sucesso",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao publicar post:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
