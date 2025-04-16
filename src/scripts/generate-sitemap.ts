import * as fs from "fs";
import * as path from "path";
import { format } from "date-fns";

// Configuração de caminhos
const SCRIPT_DIR = __dirname || path.resolve();
const POSTS_DIR = path.join(SCRIPT_DIR, "..", "content", "posts");
const SITEMAP_PATH = path.join(SCRIPT_DIR, "..", "..", "public", "sitemap.xml");

// URL base do site
const BASE_URL = "https://www.riescade.com.br";

// Data de atualização das páginas estáticas
const STATIC_PAGES_LASTMOD = format(new Date(), "yyyy-MM-dd");

// Função para ler todos os posts e suas datas
const getPostsData = (): Array<{ slug: string; publishDate: string }> => {
  const posts: Array<{ slug: string; publishDate: string }> = [];

  // Ler todos os arquivos da pasta de posts
  const files = fs.readdirSync(POSTS_DIR);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(POSTS_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const post = JSON.parse(fileContent);

      // Extrair o slug do título
      const slug = post.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-");

      posts.push({
        slug,
        publishDate: post.publish_date,
      });
    } catch (error) {
      console.error(`Erro ao processar arquivo ${file}:`, error);
    }
  }

  return posts;
};

// Função para gerar o XML do sitemap
const generateSitemapXml = (): string => {
  // Páginas estáticas do site
  const staticPages = [
    { url: "/", priority: 1.0, changefreq: "weekly" },
    { url: "/dashboard", priority: 0.8, changefreq: "weekly" },
    { url: "/tutorial", priority: 0.7, changefreq: "monthly" },
    { url: "/termos", priority: 0.5, changefreq: "yearly" },
    { url: "/politica", priority: 0.5, changefreq: "yearly" },
    { url: "/blog", priority: 0.9, changefreq: "daily" },
  ];

  // Obter dados dos posts
  const posts = getPostsData();

  // Início do XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Adicionar páginas estáticas
  for (const page of staticPages) {
    xml += "    <url>\n";
    xml += `        <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `        <lastmod>${STATIC_PAGES_LASTMOD}</lastmod>\n`;
    xml += `        <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `        <priority>${page.priority}</priority>\n`;
    xml += "    </url>\n";
  }

  // Adicionar posts do blog
  for (const post of posts) {
    xml += "    <url>\n";
    xml += `        <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
    xml += `        <lastmod>${post.publishDate}</lastmod>\n`;
    xml += "        <changefreq>monthly</changefreq>\n";
    xml += "        <priority>0.6</priority>\n";
    xml += "    </url>\n";
  }

  // Fim do XML
  xml += "</urlset>";

  return xml;
};

// Função principal para gerar e salvar o sitemap
const generateSitemap = (): void => {
  console.log("Gerando sitemap.xml...");

  try {
    const sitemapXml = generateSitemapXml();
    fs.writeFileSync(SITEMAP_PATH, sitemapXml, "utf8");
    console.log(`Sitemap gerado com sucesso em: ${SITEMAP_PATH}`);
  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);
  }
};

// Executar se for chamado diretamente
if (require.main === module) {
  generateSitemap();
}

export default generateSitemap;
