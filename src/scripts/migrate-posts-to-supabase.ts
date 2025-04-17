import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Configuração de caminhos
const SCRIPT_DIR = __dirname || path.resolve();
const POSTS_DIR = path.join(SCRIPT_DIR, "..", "content", "posts");
const LOG_DIR = path.join(SCRIPT_DIR, "..", "..", "logs");

// Garantir que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar as variáveis de ambiente
if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: Variáveis de ambiente do Supabase não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para obter a data atual formatada
const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
};

// Função para registrar mensagens de log
const logMessage = (message: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  console.log(message);
  fs.appendFileSync(path.join(LOG_DIR, "migration-logs.log"), logMessage);
};

// Função para registrar erros
const logError = (error: Error | unknown): void => {
  const timestamp = new Date().toISOString();
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorMessage = `${timestamp} - ERROR: ${errorObj.message}\n${
    errorObj.stack || ""
  }\n`;

  console.error(error);
  fs.appendFileSync(path.join(LOG_DIR, "migration-errors.log"), errorMessage);
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
const checkPostExists = async (title: string) => {
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

// Função para migrar posts para o Supabase
const migratePostsToSupabase = async () => {
  logMessage("Iniciando migração de posts para o Supabase...");
  const currentDate = getCurrentDate();

  try {
    // Ler todos os arquivos no diretório de posts
    const files = fs.readdirSync(POSTS_DIR);

    // Filtrar apenas arquivos JSON
    const postFiles = files.filter((file) => file.endsWith(".json"));

    if (postFiles.length === 0) {
      logMessage("Nenhum arquivo de post encontrado.");
      return;
    }

    logMessage(
      `Encontrados ${postFiles.length} arquivos de post para processar.`
    );

    // Contador para estatísticas
    const stats = {
      processed: 0,
      migrated: 0,
      alreadyExists: 0,
      errors: 0,
      skipped: 0,
    };

    // Processar cada arquivo
    for (const file of postFiles) {
      try {
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const post = JSON.parse(fileContent);
        stats.processed++;

        // Verificar se o post é o de hoje e já foi publicado
        const isToday = post.publish_date === currentDate;

        // Verificar se já existe no Supabase
        const existingPost = await checkPostExists(post.title);

        if (existingPost) {
          logMessage(
            `Post "${post.title}" já existe no Supabase com ID: ${existingPost.id}`
          );
          stats.alreadyExists++;
          continue;
        }

        // Determinar o status baseado na data de publicação
        // Posts de hoje ou do futuro ficam como draft, exceto se hoje for explicitamente marcado como publicado no JSON
        const isPastPost = new Date(post.publish_date) < new Date(currentDate);
        const shouldBePublished =
          isPastPost || (isToday && post.published === true);

        // Preparar o post para o Supabase
        const supabasePost = {
          title: post.title,
          slug: generateSlug(post.title),
          content: post.content,
          excerpt: post.excerpt || "",
          cover_image: post.image_path || "",
          status: shouldBePublished ? "published" : "draft",
          author: post.author || "RIESCADE Team",
          published_at: shouldBePublished ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          publish_date: post.publish_date,
          category: post.category || "General",
          tags: post.tags || [],
          views: 0,
        };

        logMessage(
          `Migrando post "${post.title}" (${file}) com status "${supabasePost.status}"...`
        );

        // Inserir no Supabase
        const { data, error } = await supabase
          .from("blog_posts")
          .insert([supabasePost])
          .select();

        if (error) {
          logError(
            new Error(`Erro ao inserir post "${post.title}": ${error.message}`)
          );
          stats.errors++;
          continue;
        }

        logMessage(
          `✅ Post "${post.title}" inserido com sucesso no Supabase com ID: ${data[0].id}`
        );
        stats.migrated++;
      } catch (error) {
        logError(
          new Error(
            `Erro ao processar arquivo ${file}: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
        stats.errors++;
      }
    }

    // Mostrar estatísticas
    logMessage("==== Migração Concluída ====");
    logMessage(`Total de arquivos processados: ${stats.processed}`);
    logMessage(`Posts migrados com sucesso: ${stats.migrated}`);
    logMessage(`Posts já existentes no Supabase: ${stats.alreadyExists}`);
    logMessage(`Posts com erros: ${stats.errors}`);
    logMessage(`Posts ignorados: ${stats.skipped}`);
  } catch (error) {
    logError(error);
  }
};

// Executar a migração se chamado diretamente
if (require.main === module) {
  migratePostsToSupabase()
    .then(() => {
      console.log("Migração concluída");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro durante a migração:", error);
      process.exit(1);
    });
}

export default migratePostsToSupabase;
