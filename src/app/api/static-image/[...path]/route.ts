import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Rota para servir imagens estáticas de forma confiável para OpenGraph
 *
 * Esta rota permite acesso a qualquer imagem do projeto, independente de onde está armazenada.
 * Útil especialmente para garantir que imagens OpenGraph sejam acessíveis para crawlers.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Obter o caminho completo da imagem a partir dos segmentos
    const { path: pathSegments } = await context.params;
    const imagePath = pathSegments.join("/");

    // Log mais detalhado
    console.log(`[static-image] Nova requisição`);
    console.log(
      `[static-image] Segmentos da URL: ${JSON.stringify(pathSegments)}`
    );
    console.log(`[static-image] Caminho completo: ${imagePath}`);

    // Verificar se a imagem está na pasta public
    const publicPath = path.join(process.cwd(), "public", imagePath);
    console.log(`[static-image] Verificando em: ${publicPath}`);

    // Verificar se o arquivo existe na pasta public
    try {
      const stats = await fs.stat(publicPath);

      if (stats.isFile()) {
        console.log(`[static-image] ✅ Arquivo encontrado em: ${publicPath}`);
        const fileBuffer = await fs.readFile(publicPath);

        // Determinar o tipo de conteúdo baseado na extensão
        const contentType = getContentType(imagePath);

        // Adicionar cache por 1 dia (86400 segundos)
        const headersList = new Headers();
        headersList.set("Content-Type", contentType);
        headersList.set("Cache-Control", "public, max-age=86400");

        console.log(
          `[static-image] Servindo arquivo: ${imagePath} (${contentType})`
        );

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: headersList,
        });
      } else {
        console.log(
          `[static-image] Caminho existe mas não é um arquivo: ${publicPath}`
        );
      }
    } catch (err) {
      console.log(
        `[static-image] ❌ Arquivo não encontrado em public: ${publicPath}`
      );
      console.log(
        `[static-image] Erro: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    // Se não estiver na pasta public, verificar na pasta de uploads (opcional)
    // Adaptar se houver outras pastas onde imagens podem estar armazenadas
    const uploadsPath = path.join(process.cwd(), "uploads", imagePath);
    console.log(`[static-image] Verificando em: ${uploadsPath}`);

    try {
      const stats = await fs.stat(uploadsPath);

      if (stats.isFile()) {
        console.log(`[static-image] ✅ Arquivo encontrado em: ${uploadsPath}`);
        const fileBuffer = await fs.readFile(uploadsPath);

        // Determinar o tipo de conteúdo baseado na extensão
        const contentType = getContentType(imagePath);

        console.log(
          `[static-image] Servindo arquivo: ${imagePath} (${contentType})`
        );

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
          },
        });
      } else {
        console.log(
          `[static-image] Caminho existe mas não é um arquivo: ${uploadsPath}`
        );
      }
    } catch (err) {
      console.log(
        `[static-image] ❌ Arquivo não encontrado em uploads: ${uploadsPath}`
      );
      console.log(
        `[static-image] Erro: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    // Verificar se é uma imagem do blog e tentar com path alternativo
    if (imagePath.includes("blog/") && !imagePath.startsWith("images/")) {
      // Tentar novamente com 'images/' prefixado
      const alternativePath = `images/${imagePath}`;
      const altPublicPath = path.join(process.cwd(), "public", alternativePath);

      console.log(
        `[static-image] Tentando caminho alternativo: ${altPublicPath}`
      );

      try {
        const stats = await fs.stat(altPublicPath);

        if (stats.isFile()) {
          console.log(
            `[static-image] ✅ Arquivo encontrado em caminho alternativo: ${altPublicPath}`
          );
          const fileBuffer = await fs.readFile(altPublicPath);
          const contentType = getContentType(alternativePath);

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
          `[static-image] ❌ Arquivo não encontrado no caminho alternativo: ${altPublicPath}`
        );
      }
    }

    // Se a imagem não foi encontrada, retornar 404
    console.log(`[static-image] ❌ Imagem não encontrada: ${imagePath}`);
    return new NextResponse("Imagem não encontrada", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[static-image] ⚠️ Erro ao processar imagem:", error);
    return new NextResponse(
      `Erro ao processar imagem: ${
        error instanceof Error ? error.message : String(error)
      }`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
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
