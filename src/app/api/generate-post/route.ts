import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt é obrigatório." },
        { status: 400 }
      );
    }

    // Montar prompt para garantir resposta estruturada
    const systemPrompt = `Você é um redator de blog de tecnologia. Gere um post em português brasileiro, respondendo em JSON com os campos: {\"titulo\":..., \"resumo\":..., \"conteudo\":...}.`;
    const userPrompt = `${prompt}\n\nResponda apenas em JSON, sem explicações extras.`;

    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.8,
        }),
      }
    );
    const data = await openaiRes.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      return NextResponse.json(
        { error: "Resposta inválida da OpenAI." },
        { status: 500 }
      );
    }
    // Tentar parsear JSON da resposta
    let result;
    const raw = data.choices[0].message.content;
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Falha ao interpretar resposta da IA.", raw },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, ...result, raw });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
