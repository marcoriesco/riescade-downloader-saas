import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

// Configuração da API Google Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    // Verificar se a chave da API está configurada
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key do Google Gemini não configurada" },
        { status: 500 }
      );
    }

    // Obter os dados da requisição
    const data = await request.json();
    const { prompt, title, excerpt, aspectRatio = "16:9" } = data;

    // Verificar os dados recebidos
    if (!prompt && !title) {
      return NextResponse.json(
        { error: "O prompt ou título é obrigatório" },
        { status: 400 }
      );
    }

    // Validar aspect ratio
    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const finalAspectRatio = validAspectRatios.includes(aspectRatio)
      ? aspectRatio
      : "16:9";

    // Preparar o prompt completo para a geração de imagem
    let fullPrompt = "";

    if (title && excerpt) {
      // Se temos título e excerpt, usamos eles para gerar um prompt mais específico
      fullPrompt = `Create a high quality digital artwork for a blog post titled "${title}" about: ${excerpt}. Make it visually appealing, detailed, with vibrant colors. DO NOT include any text, words, or letters in the image.`;
    } else if (title) {
      // Se temos apenas o título
      fullPrompt = `Create a high quality digital artwork for a blog post titled "${title}". Make it visually appealing, detailed, with vibrant colors. DO NOT include any text, words, or letters in the image.`;
    } else {
      // Caso contrário usamos o prompt fornecido
      fullPrompt = `${prompt}. Make it high quality, detailed with vibrant colors. DO NOT include any text, words, or letters in the image.`;
    }

    console.log("Prompt usado:", fullPrompt);

    // Usar o modelo Imagen 3 para geração de imagens
    const response = await genAI.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: finalAspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível gerar a imagem" },
        { status: 500 }
      );
    }

    // Obter a imagem gerada
    const generatedImage = response.generatedImages[0];
    const imageBytes = generatedImage?.image?.imageBytes;

    // Converter para URL de dados base64 para retornar ao cliente
    const imageUrl = imageBytes ? `data:image/png;base64,${imageBytes}` : "";

    // Validar se o conteúdo da imagem existe
    if (!imageBytes) {
      console.log("Imagem inválida retornada pela API");
      return NextResponse.json(
        {
          error: "A API retornou um formato inválido de imagem",
          invalidContent: "Erro ao gerar imagem",
        },
        { status: 500 }
      );
    }

    // Retornar a URL da imagem gerada
    return NextResponse.json({
      success: true,
      data: imageUrl,
      aspectRatio: finalAspectRatio,
      promptUsed: fullPrompt,
    });
  } catch (error: unknown) {
    console.error("Erro ao gerar imagem:", error);

    // Retornar mensagem de erro apropriada
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao gerar imagem";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
