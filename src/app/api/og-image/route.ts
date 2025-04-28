import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Rota para servir imagens de OpenGraph via proxy
 * Isso resolve problemas de URL direta para imagens que podem não ser acessíveis diretamente
 */
export async function GET(request: NextRequest) {
  // Obter URL da imagem dos parâmetros de consulta
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL de imagem não fornecida" },
      { status: 400 }
    );
  }

  try {
    // Decodificar a URL se necessário
    const decodedUrl = decodeURIComponent(imageUrl);

    // Log para debug
    console.log("Requisição de imagem OpenGraph:", decodedUrl);

    // Verificar se a URL é absoluta ou relativa
    let fullImageUrl = decodedUrl;
    if (!decodedUrl.startsWith("http")) {
      // Se é relativa, construir a URL completa
      fullImageUrl = `https://www.riescade.com.br${
        decodedUrl.startsWith("/") ? "" : "/"
      }${decodedUrl}`;
    }

    // Verificar se a imagem é local (caminho dentro do projeto)
    // Se a URL contém "/images/blog/", podemos tentar carregar direto do sistema de arquivos
    if (decodedUrl.includes("/images/blog/")) {
      try {
        // Extrair o caminho local
        const localPath = decodedUrl.startsWith("/")
          ? decodedUrl.substring(1)
          : decodedUrl;

        // Construir caminho do arquivo no sistema (public/...)
        const filePath = path.join(process.cwd(), "public", localPath);

        console.log("Tentando carregar imagem local de:", filePath);

        // Verificar se o arquivo existe
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const ext = path.extname(filePath).toLowerCase();

          // Determinar o tipo de conteúdo com base na extensão
          let contentType = "image/jpeg"; // padrão
          if (ext === ".png") contentType = "image/png";
          if (ext === ".webp") contentType = "image/webp";
          if (ext === ".gif") contentType = "image/gif";

          console.log("Imagem local encontrada, servindo diretamente");

          // Retornar a imagem do sistema de arquivos
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400", // Cache por 24 horas
            },
          });
        } else {
          console.log("Arquivo local não encontrado, tentando buscar via URL");
        }
      } catch (fsError) {
        console.error(
          "Erro ao carregar imagem do sistema de arquivos:",
          fsError
        );
        // Continua para tentar via URL
      }
    }

    // Se não conseguir carregar do sistema de arquivos, tenta via fetch
    console.log("Buscando imagem via URL:", fullImageUrl);

    // Buscar a imagem
    const imageResponse = await fetch(fullImageUrl, {
      headers: {
        // Adicionar cabeçalhos para evitar problemas de CORS
        "User-Agent": "Mozilla/5.0 RIESCADE OpenGraph Proxy",
      },
      next: { revalidate: 86400 }, // Revalidar a cada 24 horas
    });

    if (!imageResponse.ok) {
      console.error(
        `Erro ao buscar imagem: ${imageResponse.status} ${imageResponse.statusText}`
      );
      return NextResponse.json(
        {
          error: "Falha ao buscar imagem",
          status: imageResponse.status,
          url: fullImageUrl,
        },
        { status: 404 }
      );
    }

    // Obter o tipo de conteúdo e buffer da imagem
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageResponse.arrayBuffer();

    // Criar resposta com a imagem
    const response = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache por 24 horas
      },
    });

    return response;
  } catch (error) {
    console.error("Erro ao processar imagem OpenGraph:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar imagem" },
      { status: 500 }
    );
  }
}
