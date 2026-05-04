import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

// Permite execução longa se necessário
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    console.log("🚀 Iniciando geração de post automatizado via Gemini...");

    // 1. Verificação de Segurança (CRON_SECRET)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.warn("⚠️ Tentativa de acesso não autorizado ao CRON");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Configurar Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variáveis do Supabase não configuradas.");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Buscar os últimos 30 posts para não repetir
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(30);

    const titulosExistentes = existingPosts?.map((p) => p.title) || [];
    console.log(`📚 Encontrados ${titulosExistentes.length} posts recentes.`);

    // 4. Configurar Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // 5. Prompt para o Gemini
    const prompt = `
Você é um especialista em retrogaming, fliperamas, emulação e consoles clássicos.
Eu preciso de um post novo para o meu blog chamado RIESCADE.
Aqui estão os títulos dos artigos que JÁ TEMOS (não repita o tema):
${titulosExistentes.length > 0 ? titulosExistentes.join(", ") : "Nenhum ainda."}

Escreva um artigo fascinante e altamente engajante sobre retrogaming (pode ser sobre um console antigo, história de um jogo clássico, dicas de emulação, curiosidades, etc.).

O artigo deve estar formatado em HTML VÁLIDO e pronto para web. Em vez de Markdown, use tags HTML reais como <h2>, <h3>, <p>, <strong>, e <ul>/<li>. Não use a tag <h1> (ela já é inserida automaticamente pela página).
Crie também um prompt EM INGLÊS detalhado para gerar a imagem de capa (no estilo pixel art, retro ou ilustração vibrante).

Retorne EXATAMENTE e APENAS um objeto JSON válido, sem as marcações \`\`\`json, com a seguinte estrutura:
{
  "title": "O título chamativo do post",
  "excerpt": "Um resumo atraente com no máximo 150 caracteres",
  "content": "<p>O texto completo do artigo em <strong>HTML</strong>...</p>",
  "category": "Uma categoria (ex: História, Review, Emulação, Curiosidades)",
  "tags": ["tag1", "tag2", "tag3"],
  "imagePrompt": "A highly detailed retro gaming illustration of..."
}
`;

    console.log("🧠 Solicitando criação ao Gemini (gemini-2.5-pro)...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const responseText = response.text || "{}";
    const postData = JSON.parse(responseText);

    if (!postData.title || !postData.content) {
      throw new Error("O Gemini retornou um JSON incompleto.");
    }
    console.log(`✨ Post gerado com sucesso: "${postData.title}"`);

    // 6. Gerar slug seguro
    const slug = postData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");

    // 7. Gerar URL da Imagem (direto da Pollinations)
    console.log("🖼️ Gerando URL da imagem via Pollinations...");
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      postData.imagePrompt
    )}?width=1200&height=630&nologo=true&seed=${seed}`;

    console.log(`💾 URL da imagem gerada: ${imageUrl}`);

    // 8. Inserir no Supabase
    const now = new Date();
    const currentDateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    const newPost = {
      title: postData.title,
      slug: slug,
      content: postData.content,
      excerpt: postData.excerpt,
      cover_image: imageUrl,
      status: "published", // Ou draft se preferir revisar antes
      author: "RIESCADE AI",
      published_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      category: postData.category || "Retrogaming",
      tags: postData.tags || ["retrogaming"],
      views: 0,
      publish_date: currentDateStr,
    };

    const { error: insertError } = await supabase
      .from("blog_posts")
      .insert([newPost]);

    if (insertError) {
      throw new Error(`Erro ao salvar no banco: ${insertError.message}`);
    }

    console.log("✅ Processo concluído! Post publicado com sucesso.");
    return NextResponse.json({
      success: true,
      message: "Post automatizado publicado!",
      post: {
        title: newPost.title,
        slug: newPost.slug,
      },
    });
  } catch (error) {
    console.error("❌ Erro fatal na automação:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
