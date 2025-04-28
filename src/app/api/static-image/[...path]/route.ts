import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Rota para servir imagens estáticas de forma confiável para OpenGraph
 *
 * Esta rota permite acesso a qualquer imagem do projeto, independente de onde está armazenada.
 * Útil especialmente para garantir que imagens OpenGraph sejam acessíveis para crawlers.
 *
 * @param req - Requisição Next
 * @param params - Parâmetros da rota, incluindo o caminho da imagem
 */
export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  try {
    // Obter o caminho completo da imagem a partir dos segmentos
    const imagePath = context.params.path.join("/");
    console.log(`[static-image] Requisição para: ${imagePath}`);

    // Verificar se a imagem está na pasta public
    const publicPath = path.join(process.cwd(), "public", imagePath);

    // Verificar se o arquivo existe na pasta public
    try {
      const stats = await fs.stat(publicPath);

      if (stats.isFile()) {
        console.log(`[static-image] Arquivo encontrado em: ${publicPath}`);
        const fileBuffer = await fs.readFile(publicPath);

        // Determinar o tipo de conteúdo baseado na extensão
        const contentType = getContentType(imagePath);

        // Adicionar cache por 1 dia (86400 segundos)
        const headersList = new Headers();
        headersList.set("Content-Type", contentType);
        headersList.set("Cache-Control", "public, max-age=86400");

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: headersList,
        });
      }
    } catch {
      console.log(
        `[static-image] Arquivo não encontrado em public: ${publicPath}`
      );
    }

    // Se não estiver na pasta public, verificar na pasta de uploads (opcional)
    // Adaptar se houver outras pastas onde imagens podem estar armazenadas
    const uploadsPath = path.join(process.cwd(), "uploads", imagePath);

    try {
      const stats = await fs.stat(uploadsPath);

      if (stats.isFile()) {
        console.log(`[static-image] Arquivo encontrado em: ${uploadsPath}`);
        const fileBuffer = await fs.readFile(uploadsPath);

        // Determinar o tipo de conteúdo baseado na extensão
        const contentType = getContentType(imagePath);

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    } catch {
      console.log(
        `[static-image] Arquivo não encontrado em uploads: ${uploadsPath}`
      );
    }

    // Se a imagem não foi encontrada, retornar 404
    console.log(`[static-image] Imagem não encontrada: ${imagePath}`);
    return new NextResponse("Imagem não encontrada", { status: 404 });
  } catch (error) {
    console.error("[static-image] Erro ao processar imagem:", error);
    return new NextResponse("Erro ao processar imagem", { status: 500 });
  }
}

/**
 * Determina o tipo de conteúdo baseado na extensão do arquivo
 */
function getContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

// Configuração para permitir cache da resposta
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidar a cada hora
