import * as fs from "fs";
import * as path from "path";

// Configuração de caminhos
const SCRIPT_DIR = __dirname || path.resolve();
const POSTS_DIR = path.join(SCRIPT_DIR, "..", "content", "posts");
const LOG_DIR = path.join(SCRIPT_DIR, "..", "..", "logs");

// Garantir que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

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
  fs.appendFileSync(path.join(LOG_DIR, "extract-posts-logs.log"), logMessage);
};

// Função para registrar erros
const logError = (error: Error | unknown): void => {
  const timestamp = new Date().toISOString();
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorMessage = `${timestamp} - ERROR: ${errorObj.message}\n${
    errorObj.stack || ""
  }\n`;

  console.error(error);
  fs.appendFileSync(
    path.join(LOG_DIR, "extract-posts-errors.log"),
    errorMessage
  );
};

// Função para gerar nome de arquivo a partir do título e data
const generateFileName = (post: Post): string => {
  const { publish_date, title } = post;

  // Criar slug a partir do título
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais exceto hífens
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-"); // Remove hífens duplicados

  return `${publish_date}-${slug}.json`;
};

// Função principal para extrair posts
const extractPosts = async (): Promise<void> => {
  logMessage("Iniciando extração de posts do arquivo criar-posts.json...");

  try {
    // Carregar o arquivo de origem
    const sourceFilePath = path.join(POSTS_DIR, "criar-posts.json");

    if (!fs.existsSync(sourceFilePath)) {
      throw new Error(`Arquivo de origem não encontrado: ${sourceFilePath}`);
    }

    const fileContent = fs.readFileSync(sourceFilePath, "utf8");
    const posts = JSON.parse(fileContent) as Post[];

    logMessage(`Encontrados ${posts.length} posts para extrair.`);

    let extractedCount = 0;

    // Processar cada post
    for (const post of posts) {
      try {
        // Garantir que tenha a data e título
        if (!post.title || !post.publish_date) {
          logMessage(
            `Pulando post sem título ou data de publicação: ${
              post.title || "Sem título"
            }`
          );
          continue;
        }

        // Definir published como true
        post.published = true;

        // Gerar nome do arquivo
        const fileName = generateFileName(post);
        const filePath = path.join(POSTS_DIR, fileName);

        // Salvar o post como arquivo individual
        fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf8");
        extractedCount++;

        logMessage(`Post extraído e salvo como: ${fileName}`);
      } catch (error) {
        logError(error);
        logMessage(
          `Erro ao processar post "${post.title}": ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    logMessage(
      `Extração concluída. ${extractedCount} de ${posts.length} posts foram extraídos com sucesso.`
    );
  } catch (error) {
    logError(error);
    logMessage(
      `Erro durante o processo de extração: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

// Executar a função principal
extractPosts()
  .then(() => {
    logMessage("Processamento concluído.");
  })
  .catch((error) => {
    logError(error);
    process.exit(1);
  });
