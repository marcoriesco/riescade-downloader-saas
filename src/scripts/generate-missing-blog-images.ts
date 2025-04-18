import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import * as dotenv from "dotenv";
// Vamos importar o módulo de forma dinâmica na função que o utiliza

// Carregar variáveis de ambiente
dotenv.config({ path: ".env.local" });

// Configuração de caminhos
const BLOG_IMAGES_DIR = path.join(process.cwd(), "public", "images", "blog");

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar as variáveis de ambiente
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: Variáveis de ambiente do Supabase não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Definir interface para resposta da API
interface ImageApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Função para gerar um nome de arquivo a partir do slug
function generateImageFilename(slug: string): string {
  return `${slug}.webp`;
}

// Função para gerar um prompt com base no título do post
function generatePrompt(title: string, category: string): string {
  return `Create a detailed, professional illustration for a blog post about video games with the title "${title}" in the category "${category}". The image should be high-quality, colorful, and visually appealing for a gaming blog.`;
}

// Função para baixar a imagem da URL e salvá-la no sistema de arquivos
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    // Importar fetch dinamicamente
    const { default: fetch } = await import("node-fetch");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const filepath = path.join(BLOG_IMAGES_DIR, filename);

    await fs.writeFile(filepath, Buffer.from(buffer));

    return `/images/blog/${filename}`;
  } catch (error) {
    console.error("❌ Erro ao baixar a imagem:", error);
    throw error;
  }
}

// Função principal para gerar imagens para posts sem imagens
async function generateMissingBlogImages() {
  console.log("🔍 Buscando posts sem imagens...");

  try {
    // Importar fetch dinamicamente
    const { default: fetch } = await import("node-fetch");

    // Garantir que o diretório de imagens de blog exists
    await fs.mkdir(BLOG_IMAGES_DIR, { recursive: true });

    // Buscar posts sem imagens no Supabase
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, category, cover_image")
      .or("cover_image.is.null,cover_image.eq.")
      .limit(10); // Limitar a 10 posts por vez para evitar sobrecarga

    if (error) {
      console.error("❌ Erro ao buscar posts:", error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log("✅ Todos os posts já possuem imagens!");
      return;
    }

    console.log(
      `🖼️ Encontrados ${posts.length} posts sem imagens. Gerando imagens...`
    );

    // Processar cada post sem imagem
    for (const post of posts) {
      try {
        console.log(`⏳ Processando post: ${post.title}`);

        // Gerar prompt para a imagem
        const prompt = generatePrompt(post.title, post.category);

        // Chamar a API local para gerar a imagem
        const imageResponse = await fetch(
          "http://localhost:3000/api/generate-blog-image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!imageResponse.ok) {
          throw new Error(`Erro na API: ${await imageResponse.text()}`);
        }

        // Tipar corretamente a resposta
        const imageData = (await imageResponse.json()) as ImageApiResponse;

        if (!imageData.success || !imageData.data) {
          throw new Error("Resposta da API inválida");
        }

        // Gerar nome de arquivo para a imagem
        const filename = generateImageFilename(post.slug);

        // Baixar e salvar a imagem
        const imagePath = await downloadImage(imageData.data, filename);

        // Atualizar o post no Supabase
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update({ cover_image: imagePath })
          .eq("id", post.id);

        if (updateError) {
          throw new Error(`Erro ao atualizar post: ${updateError.message}`);
        }

        console.log(`✅ Imagem gerada com sucesso para: ${post.title}`);
      } catch (error) {
        console.error(`❌ Erro ao processar post "${post.title}":`, error);
      }
    }

    console.log("🎉 Processo finalizado!");
  } catch (error) {
    console.error("❌ Erro geral no processo:", error);
  }
}

// Executar o script
generateMissingBlogImages()
  .then(() => {
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro no script:", error);
    process.exit(1);
  });
