import { NextRequest, NextResponse } from "next/server";

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

    // Buscar a imagem
    const imageResponse = await fetch(fullImageUrl, {
      headers: {
        // Adicionar cabeçalhos para evitar problemas de CORS
        "User-Agent": "Mozilla/5.0 RIESCADE OpenGraph Proxy",
      },
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
