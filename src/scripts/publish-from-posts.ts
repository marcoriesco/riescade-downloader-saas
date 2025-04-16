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

// Garantir que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Função para obter a data atual formatada
const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
};

// Definição da interface para os posts
interface Post {
  title: string;
  publish_date: string;
  content: string;
  excerpt?: string;
  image_path?: string;
  category?: string;
  tags?: string[];
  author?: string;
  author_image?: string;
  published?: boolean;
}

// Função para registrar mensagens de log
const logMessage = (message: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  console.log(message);
  fs.appendFileSync(path.join(LOG_DIR, "publish-logs.log"), logMessage);
};

// Função para registrar erros
const logError = (error: Error | unknown): void => {
  const timestamp = new Date().toISOString();
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorMessage = `${timestamp} - ERROR: ${errorObj.message}\n${
    errorObj.stack || ""
  }\n`;

  console.error(error);
  fs.appendFileSync(path.join(LOG_DIR, "publish-errors.log"), errorMessage);
};

// Função para converter o post do formato JSON para o formato do Supabase
const preparePostForSupabase = (post: Post) => {
  // Gerar um slug a partir do título
  const slug = post.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");

  return {
    title: post.title,
    slug: slug,
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
  };
};

// Função para verificar se o post já existe no Supabase
const checkPostExists = async (title: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title")
    .eq("title", title)
    .limit(1);

  if (error) {
    throw new Error(`Erro ao verificar post existente: ${error.message}`);
  }

  return data.length > 0 ? data[0] : null;
};

// Função para publicar um post no Supabase
const publishPostToSupabase = async (post: Post) => {
  try {
    // Verificar se já existe um post com o mesmo título
    const existingPost = await checkPostExists(post.title);

    if (existingPost) {
      logMessage(
        `Post "${post.title}" já existe no Supabase com ID: ${existingPost.id}`
      );
      return existingPost;
    }

    // Preparar o post para o Supabase
    const supabasePost = preparePostForSupabase(post);

    // Inserir no Supabase
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([supabasePost])
      .select();

    if (error) {
      throw new Error(`Erro ao inserir post no Supabase: ${error.message}`);
    }

    logMessage(
      `Post "${post.title}" inserido com sucesso no Supabase com ID: ${data[0].id}`
    );
    return data[0];
  } catch (error) {
    logError(error);
    throw error;
  }
};

// Função principal para publicar posts agendados
const publishScheduledPosts = async (): Promise<void> => {
  const currentDate = getCurrentDate();

  logMessage(`Iniciando verificação de posts agendados para ${currentDate}...`);

  try {
    // Ler todos os arquivos da pasta de conteúdo
    const files = fs.readdirSync(POSTS_DIR);

    // Filtrar apenas arquivos JSON que começam com a data atual
    const todaysPostFiles = files.filter(
      (file: string) => file.startsWith(currentDate) && file.endsWith(".json")
    );

    if (todaysPostFiles.length === 0) {
      logMessage("Nenhum post para publicar hoje.");
      return;
    }

    // Publicar o primeiro post encontrado
    const postFile = todaysPostFiles[0];
    const filePath = path.join(POSTS_DIR, postFile);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const post = JSON.parse(fileContent) as Post;

    if (post.published) {
      logMessage(`O post "${post.title}" já está publicado.`);
      return;
    }

    logMessage(`Publicando post para hoje: "${post.title}"`);

    try {
      // Publicar no Supabase
      await publishPostToSupabase(post);

      // Marcar como publicado no arquivo JSON
      post.published = true;
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf8");
      logMessage(
        `Arquivo ${postFile} atualizado, post marcado como publicado.`
      );

      logMessage("Publicação concluída com sucesso.");
    } catch (error) {
      logError(
        new Error(
          `Erro ao publicar post "${post.title}": ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    }
  } catch (error) {
    logError(error);
  }
};

// Função para publicação forçada de um post específico para testes
export const forcePublishOnePost = async (postFile: string): Promise<void> => {
  try {
    const filePath = path.join(POSTS_DIR, postFile);

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const post = JSON.parse(fileContent) as Post;

      if (!post.published) {
        logMessage(`Forçando publicação do post: ${post.title}`);

        try {
          // Publicar no Supabase
          await publishPostToSupabase(post);

          // Marcar como publicado
          post.published = true;
          fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf8");

          logMessage(`Post "${post.title}" publicado com sucesso!`);
        } catch (error) {
          logError(
            new Error(
              `Erro ao forçar publicação do post "${post.title}": ${
                error instanceof Error ? error.message : String(error)
              }`
            )
          );
        }
      } else {
        logMessage(`O post "${post.title}" já está publicado.`);
      }
    } else {
      logMessage(`Arquivo ${postFile} não encontrado!`);
    }
  } catch (error) {
    logError(error);
  }
};

// Executar a função principal se for chamado diretamente
if (require.main === module) {
  publishScheduledPosts().catch(logError);
}

export default publishScheduledPosts;
