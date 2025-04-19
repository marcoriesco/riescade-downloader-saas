import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import * as dotenv from "dotenv";

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

// Definir interface para a resposta da API
interface ImageApiResponse {
  success: boolean;
  data?: string;
  error?: string;
  invalidContent?: string;
  aspectRatio?: string;
  promptUsed?: string;
}

// Definir interface para posts com imagens ausentes
interface MissingImage {
  id: string;
  title: string;
  slug: string;
  imagePath?: string;
}

// Função para gerar um nome de arquivo a partir do slug
function generateImageFilename(slug: string): string {
  return `${slug}.webp`;
}

// Função para gerar um prompt com base no título do post
function generatePrompt(title: string): string {
  return `Create a detailed, professional illustration for a blog post about video games with the title "${title}". The image should be high-quality, colorful, and visually appealing for a gaming blog.`;
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
  } catch (err) {
    console.error("❌ Erro ao baixar a imagem:", err);
    throw err;
  }
}

// Função principal para gerar imagens para posts com base na lista de imagens ausentes
async function generateMissingBlogImagesFromList() {
  console.log("🔍 Gerando imagens para posts com imagens ausentes...");

  try {
    // Importar fetch dinamicamente
    const { default: fetch } = await import("node-fetch");

    // Verificar se o arquivo com a lista de imagens ausentes existe
    let missingImages: MissingImage[] = [];
    try {
      const missingImagesJson = await fs.readFile(
        "missing-blog-images.json",
        "utf8"
      );
      missingImages = JSON.parse(missingImagesJson);
    } catch (err) {
      console.error("❌ Erro ao ler arquivo de imagens ausentes:", err);
      console.log("🔄 Executando verificação de imagens ausentes...");

      // Se o arquivo não existir, buscar todos os posts no Supabase
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, cover_image");

      if (error) {
        console.error("❌ Erro ao buscar posts:", error.message);
        return;
      }

      // Processar apenas posts com caminho de imagem definido
      const postsWithImagePaths =
        posts?.filter((post) => post.cover_image) || [];

      // Verificar quais imagens estão ausentes
      for (const post of postsWithImagePaths) {
        if (!post.cover_image) continue;

        // Extrair o caminho relativo da imagem a partir da URL
        const imagePath = post.cover_image.startsWith("/")
          ? post.cover_image.substring(1) // Remove a barra inicial se existir
          : post.cover_image;

        // Caminho completo no sistema de arquivos
        const fullImagePath = path.join(process.cwd(), "public", imagePath);

        try {
          // Verificar se o arquivo existe
          await fs.access(fullImagePath);
        } catch {
          // Arquivo não existe
          missingImages.push({
            id: post.id,
            title: post.title,
            slug: post.slug,
            imagePath: post.cover_image,
          });
        }
      }
    }

    if (missingImages.length === 0) {
      console.log("✅ Não há imagens ausentes para gerar!");
      return;
    }

    console.log(
      `🖼️ Encontradas ${missingImages.length} imagens ausentes. Gerando imagens...`
    );

    // Garantir que o diretório de imagens existe
    await fs.mkdir(BLOG_IMAGES_DIR, { recursive: true });

    // Processar cada imagem ausente
    for (const item of missingImages) {
      try {
        console.log(`⏳ Processando post: ${item.title}`);

        // Gerar prompt para a imagem
        const prompt = generatePrompt(item.title);

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
          const errorText = await imageResponse.text();
          try {
            const errorJson = JSON.parse(errorText) as ImageApiResponse;
            if (errorJson.invalidContent) {
              console.error(
                `Conteúdo inválido recebido: "${errorJson.invalidContent}"`
              );
            }
          } catch {
            // Erro ao analisar o JSON, continuar com o texto original
          }
          throw new Error(`Erro na API: ${errorText}`);
        }

        const imageResult = (await imageResponse.json()) as ImageApiResponse;

        if (!imageResult.success || !imageResult.data) {
          throw new Error("Resposta da API inválida");
        }

        // Gerar nome de arquivo para a imagem
        const filename = generateImageFilename(item.slug);

        // Baixar e salvar a imagem
        const imagePath = await downloadImage(imageResult.data, filename);

        // Atualizar o post no Supabase (apenas se o caminho for diferente)
        if (imagePath !== item.imagePath) {
          const { error: updateError } = await supabase
            .from("blog_posts")
            .update({ cover_image: imagePath })
            .eq("id", item.id);

          if (updateError) {
            throw new Error(`Erro ao atualizar post: ${updateError.message}`);
          }
        }

        console.log(`✅ Imagem gerada com sucesso para: ${item.title}`);
      } catch (error) {
        console.error(`❌ Erro ao processar post "${item.title}":`, error);
      }
    }

    console.log("🎉 Processo finalizado!");
  } catch (error) {
    console.error("❌ Erro geral no processo:", error);
  }
}

// Executar o script
generateMissingBlogImagesFromList()
  .then(() => {
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro no script:", error);
    process.exit(1);
  });
