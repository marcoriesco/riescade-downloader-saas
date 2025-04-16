import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Configuração de caminhos
const SCRIPT_DIR = __dirname || path.resolve();
const CONTENT_DIR = path.join(SCRIPT_DIR, "..", "content", "scheduled-posts");
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

// Definição da interface para os posts agendados
interface ScheduledPost {
  title: string;
  publish_date: string;
  content: string;
  excerpt?: string;
  image_path?: string;
  category?: string;
  tags?: string[];
  author?: string;
  author_image?: string;
  featured?: boolean;
  published?: boolean;
}

// Definição da interface para os dados semanais
interface WeeklyData {
  week: number;
  year: number;
  posts: ScheduledPost[];
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
const preparePostForSupabase = (post: ScheduledPost) => {
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
    featured: post.featured || false,
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
const publishPostToSupabase = async (post: ScheduledPost) => {
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
    const files = fs.readdirSync(CONTENT_DIR);

    // Filtrar apenas arquivos JSON que seguem o padrão de semanas (YYYY-WXX.json)
    const weeklyFiles = files.filter(
      (file: string) =>
        file.endsWith(".json") && /^\d{4}-W\d{2}\.json$/.test(file)
    );

    if (weeklyFiles.length === 0) {
      logMessage("Nenhum arquivo semanal encontrado.");
      return;
    }

    // Armazenar todos os posts disponíveis para hoje
    const allPostsForToday: Array<{
      file: string;
      post: ScheduledPost;
      index: number;
    }> = [];

    // Coletar todos os posts para hoje de todos os arquivos
    for (const file of weeklyFiles) {
      const filePath = path.join(CONTENT_DIR, file);

      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const weekData = JSON.parse(fileContent) as WeeklyData;

        if (!weekData.posts || !Array.isArray(weekData.posts)) {
          logMessage(`Arquivo ${file} não contém lista de posts válida.`);
          continue;
        }

        // Encontrar posts para a data atual que ainda não foram publicados
        weekData.posts.forEach((post, index) => {
          if (post.publish_date === currentDate && post.published !== true) {
            allPostsForToday.push({
              file,
              post,
              index,
            });
          }
        });
      } catch (error) {
        logError(
          new Error(
            `Erro ao processar arquivo ${file}: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      }
    }

    // Verificar se temos posts para publicar hoje
    if (allPostsForToday.length === 0) {
      logMessage("Nenhum post para publicar hoje.");
      return;
    }

    // Ordenar posts por featured (primeiro os destacados) e depois por título
    allPostsForToday.sort((a, b) => {
      // Primeiro critério: featured (true vem antes)
      if (a.post.featured === true && b.post.featured !== true) return -1;
      if (a.post.featured !== true && b.post.featured === true) return 1;

      // Segundo critério: título em ordem alfabética
      return a.post.title.localeCompare(b.post.title);
    });

    // Publicar apenas o primeiro post da lista ordenada (1 post por dia)
    const postToPublish = allPostsForToday[0];

    logMessage(`Publicando 1 post para hoje: "${postToPublish.post.title}"`);

    try {
      // Publicar no Supabase
      await publishPostToSupabase(postToPublish.post);

      // Marcar como publicado no arquivo JSON
      const filePath = path.join(CONTENT_DIR, postToPublish.file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const weekData = JSON.parse(fileContent) as WeeklyData;

      // Atualizar o status published
      weekData.posts[postToPublish.index].published = true;

      // Salvar o arquivo atualizado
      fs.writeFileSync(filePath, JSON.stringify(weekData, null, 2), "utf8");
      logMessage(
        `Arquivo ${postToPublish.file} atualizado, post marcado como publicado.`
      );

      logMessage("Publicação concluída com sucesso. 1 post publicado.");
    } catch (error) {
      logError(
        new Error(
          `Erro ao publicar post "${postToPublish.post.title}": ${
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
export const forcePublishOnePost = async (
  weekFile: string,
  postIndex: number = 0
): Promise<void> => {
  try {
    const filePath = path.join(CONTENT_DIR, weekFile);

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const weekData = JSON.parse(fileContent) as WeeklyData;

      if (weekData.posts && weekData.posts.length > postIndex) {
        const post = weekData.posts[postIndex];

        if (!post.published) {
          logMessage(`Forçando publicação do post: ${post.title}`);

          try {
            // Publicar no Supabase
            await publishPostToSupabase(post);

            // Marcar como publicado
            post.published = true;
            fs.writeFileSync(
              filePath,
              JSON.stringify(weekData, null, 2),
              "utf8"
            );

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
        logMessage(`Índice de post inválido no arquivo ${weekFile}.`);
      }
    } else {
      logMessage(`Arquivo ${weekFile} não encontrado!`);
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
