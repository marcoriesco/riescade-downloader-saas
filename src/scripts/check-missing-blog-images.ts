import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config({ path: ".env.local" });

// Configuração de caminhos
const BLOG_IMAGES_DIR = path.join(process.cwd(), "public");

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

// Função principal para verificar imagens ausentes
async function checkMissingBlogImages() {
  console.log("🔍 Verificando imagens dos posts...");

  try {
    // Buscar todos os posts no Supabase
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, cover_image");

    if (error) {
      console.error("❌ Erro ao buscar posts:", error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log("ℹ️ Nenhum post encontrado!");
      return;
    }

    console.log(`📊 Total de posts: ${posts.length}`);

    // Posts com caminhos de imagens definidos no banco
    const postsWithImagePaths = posts.filter((post) => post.cover_image);
    console.log(
      `🖼️ Posts com caminhos de imagem definidos: ${postsWithImagePaths.length}`
    );

    // Posts sem caminhos de imagens definidos no banco
    const postsWithoutImagePaths = posts.filter((post) => !post.cover_image);
    console.log(
      `🚫 Posts sem caminhos de imagem definidos: ${postsWithoutImagePaths.length}`
    );

    if (postsWithoutImagePaths.length > 0) {
      console.log("\n📋 Posts sem caminhos de imagem:");
      postsWithoutImagePaths.forEach((post) => {
        console.log(`   - ${post.title} (ID: ${post.id})`);
      });
    }

    // Verificar se os arquivos de imagem existem fisicamente
    const missingImages = [];

    for (const post of postsWithImagePaths) {
      if (!post.cover_image) continue;

      // Extrair o caminho relativo da imagem a partir da URL
      const imagePath = post.cover_image.startsWith("/")
        ? post.cover_image.substring(1) // Remove a barra inicial se existir
        : post.cover_image;

      // Caminho completo no sistema de arquivos
      const fullImagePath = path.join(BLOG_IMAGES_DIR, imagePath);

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
          fullImagePath,
        });
      }
    }

    // Mostrar resultados
    console.log(
      `\n🧩 Imagens referenciadas que NÃO existem fisicamente: ${missingImages.length}`
    );

    if (missingImages.length > 0) {
      console.log("\n📋 Lista de imagens ausentes:");
      missingImages.forEach((item) => {
        console.log(`   - ${item.title}`);
        console.log(`     Caminho registrado: ${item.imagePath}`);
        console.log(`     Caminho físico: ${item.fullImagePath}`);
        console.log(`     ID do post: ${item.id}`);
        console.log("");
      });

      // Salvar a lista de imagens ausentes em um arquivo JSON
      const missingImagesJson = JSON.stringify(missingImages, null, 2);
      await fs.writeFile("missing-blog-images.json", missingImagesJson);
      console.log(
        "💾 Lista de imagens ausentes salva em 'missing-blog-images.json'"
      );
    } else {
      console.log(
        "✅ Todas as imagens referenciadas no banco existem fisicamente!"
      );
    }
  } catch (error) {
    console.error("❌ Erro geral no processo:", error);
  }
}

// Executar o script
checkMissingBlogImages()
  .then(() => {
    console.log("\n🏁 Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro no script:", error);
    process.exit(1);
  });
