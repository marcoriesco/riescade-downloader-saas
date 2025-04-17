import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
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

// Função para verificar se o post já existe no Supabase
const checkPostExists = async (supabase: SupabaseClient, title: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, status")
    .eq("title", title)
    .limit(1);

  if (error) {
    throw new Error(`Erro ao verificar post existente: ${error.message}`);
  }

  return data.length > 0 ? data[0] : null;
};

export async function GET() {
  console.log(
    "🔄 Iniciando migração de posts para o Supabase:",
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
    console.log(`📆 Data atual: ${currentDate}`);

    // Caminho para os posts
    const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

    // Verificar se o diretório existe no ambiente
    if (!fs.existsSync(POSTS_DIR)) {
      console.warn(
        "⚠️ Diretório de posts não encontrado no ambiente serverless"
      );
      return NextResponse.json({
        success: false,
        message: "Diretório de posts não encontrado",
        timestamp: new Date().toISOString(),
      });
    }

    // Ler os arquivos no diretório
    const files = fs.readdirSync(POSTS_DIR);
    const postFiles = files.filter((file) => file.endsWith(".json"));

    if (postFiles.length === 0) {
      console.log("📭 Nenhum post encontrado para migrar.");
      return NextResponse.json({
        success: true,
        message: "Nenhum post encontrado para migrar",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🔍 Encontrados ${postFiles.length} posts para processar`);

    // Estatísticas
    const stats = {
      processed: 0,
      migrated: 0,
      alreadyExists: 0,
      errors: 0,
      skipped: 0,
    };

    // Processar cada arquivo encontrado
    for (const postFile of postFiles) {
      try {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const post = JSON.parse(fileContent);
        stats.processed++;

        // Verificar se o post já existe no Supabase
        const existingPost = await checkPostExists(supabase, post.title);
        if (existingPost) {
          console.log(
            `ℹ️ Post "${post.title}" já existe no Supabase com ID: ${existingPost.id}`
          );
          stats.alreadyExists++;
          continue;
        }

        // Verificar se o post é de hoje
        const isToday = post.publish_date === currentDate;

        // Determinar status com base na data - posts de hoje são publicados, os demais são drafts
        const status = isToday ? "published" : "draft";
        const publishedAt = isToday ? new Date().toISOString() : null;

        // Preparar o post para inserção no Supabase
        const supabasePost = {
          title: post.title,
          slug: generateSlug(post.title),
          content: post.content,
          excerpt: post.excerpt || "",
          cover_image: post.image_path || "",
          status: status,
          author: post.author || "RIESCADE Team",
          published_at: publishedAt,
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
            `❌ Erro ao inserir post "${post.title}": ${insertError.message}`
          );
          stats.errors++;
          continue;
        }

        // Log de sucesso com base no status
        if (status === "published") {
          console.log(
            `✅ Post "${post.title}" inserido como PUBLICADO com ID: ${insertedPost[0].id}`
          );
        } else {
          console.log(
            `✅ Post "${post.title}" inserido como RASCUNHO com ID: ${insertedPost[0].id}`
          );
        }

        stats.migrated++;
      } catch (error) {
        console.error(`❌ Erro ao processar arquivo ${postFile}:`, error);
        stats.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migração de posts concluída",
      stats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);

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
