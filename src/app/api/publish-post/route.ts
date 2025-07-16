import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Função para obter a data atual formatada YYYY-MM-DD
const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

// Função para gerar slug a partir do título
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
};

export async function GET() {
  console.log(
    "🔄 Iniciando cron job de publicação de post:",
    new Date().toISOString()
  );

  try {
    // Configuração do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const currentDate = getCurrentDate();
    console.log(`📅 Verificando posts agendados para ${currentDate}...`);

    // Verificar posts já no Supabase com publish_date para hoje que ainda não foram publicados
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("publish_date", currentDate)
      .eq("status", "draft");

    if (fetchError) {
      throw new Error(`Erro ao buscar posts agendados: ${fetchError.message}`);
    }

    // Se encontrou posts agendados no Supabase, publicá-los
    if (scheduledPosts && scheduledPosts.length > 0) {
      console.log(
        `📝 Encontrados ${scheduledPosts.length} posts agendados no Supabase para publicação`
      );

      for (const post of scheduledPosts) {
        // Atualizar o status para "published"
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        if (updateError) {
          console.error(
            `❌ Erro ao publicar post "${post.title}": ${updateError.message}`
          );
        } else {
          console.log(`✅ Post "${post.title}" publicado com sucesso!`);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${scheduledPosts.length} posts publicados com sucesso`,
        posts: scheduledPosts.map((p) => p.title),
        timestamp: new Date().toISOString(),
      });
    }

    // Se não achou no Supabase, procurar nos arquivos locais (para compatibilidade)
    console.log("🔍 Verificando posts em arquivos locais...");

    // Caminho para os posts
    const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

    // Verificar se o diretório existe no ambiente
    if (!fs.existsSync(POSTS_DIR)) {
      console.warn(
        "⚠️ Diretório de posts não encontrado no ambiente serverless"
      );
      return NextResponse.json({
        success: true,
        message: "Nenhum post para publicar hoje",
        timestamp: new Date().toISOString(),
      });
    }

    // Ler os arquivos no diretório
    const files = fs.readdirSync(POSTS_DIR);

    // Filtrar arquivos JSON que começam com a data atual
    const todaysPostFiles = files.filter(
      (file) => file.startsWith(currentDate) && file.endsWith(".json")
    );

    if (todaysPostFiles.length === 0) {
      console.log("📭 Nenhum post para publicar hoje.");
      return NextResponse.json({
        success: true,
        message: "Nenhum post para publicar hoje",
        timestamp: new Date().toISOString(),
      });
    }

    const publishedPosts = [];

    // Processar cada arquivo encontrado
    for (const postFile of todaysPostFiles) {
      const filePath = path.join(POSTS_DIR, postFile);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const post = JSON.parse(fileContent);

      // Verificar se o post já existe no Supabase
      const { data: existingPosts, error: checkError } = await supabase
        .from("blog_posts")
        .select("id, title")
        .eq("title", post.title)
        .limit(1);

      if (checkError) {
        console.error(
          `❌ Erro ao verificar post existente: ${checkError.message}`
        );
        continue;
      }

      if (existingPosts && existingPosts.length > 0) {
        console.log(
          `ℹ️ Post "${post.title}" já existe no Supabase com ID: ${existingPosts[0].id}`
        );
        continue;
      }

      // Preparar o post para inserção no Supabase
      const supabasePost = {
        title: post.title,
        slug: generateSlug(post.title),
        content: post.content,
        excerpt: post.excerpt || "",
        cover_image: post.image_path || "",
        status: "published",
        author: post.author || "RIESCADE Team",
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: post.category || "General",
        tags: post.tags || [],
        views: 0,
        publish_date: post.publish_date || currentDate,
      };

      // Inserir no Supabase
      const { data: insertedPost, error: insertError } = await supabase
        .from("blog_posts")
        .insert([supabasePost])
        .select();

      if (insertError) {
        console.error(
          `❌ Erro ao inserir post no Supabase: ${insertError.message}`
        );
        continue;
      }

      console.log(
        `✅ Post "${post.title}" inserido com sucesso no Supabase com ID: ${insertedPost[0].id}`
      );
      publishedPosts.push(post.title);
    }

    return NextResponse.json({
      success: true,
      message:
        publishedPosts.length > 0
          ? `${publishedPosts.length} posts publicados com sucesso`
          : "Nenhum post novo para publicar hoje",
      posts: publishedPosts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao publicar post:", error);

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

export async function POST(request: Request) {
  try {
    // Verifica se o body é multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type deve ser multipart/form-data" },
        { status: 400 }
      );
    }

    // Usar formData API do Next.js (Node 18+)
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as File | null;

    if (!title || !excerpt || !content || !image) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Gerar slug
    const slug = generateSlug(title);
    // Gerar nome de arquivo para imagem
    const ext = image.name.split(".").pop() || "webp";
    const imageFileName = `${slug}.${ext}`;
    const imagePath = path.join(
      process.cwd(),
      "public",
      "images",
      "blog",
      imageFileName
    );
    const imageUrl = `/images/blog/${imageFileName}`;

    // Salvar imagem no disco
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(imagePath, buffer);

    // Configuração do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Criar post no Supabase
    const now = new Date();
    const post = {
      title,
      slug,
      content,
      excerpt,
      cover_image: imageUrl,
      status: "published",
      author: "RIESCADE Team",
      published_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      category: "General",
      tags: [],
      views: 0,
      publish_date: now.toISOString().split("T")[0],
    };
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([post])
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, post: data });
  } catch (error) {
    console.error("Erro ao criar post manualmente:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
