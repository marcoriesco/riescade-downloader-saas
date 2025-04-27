import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog-service";
import { BlogPost } from "@/types/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Obter todos os posts do blog
  const { data: blogPosts } = await getBlogPosts({ limit: 1000 });

  // Criar entradas para cada post do blog
  const blogEntries = blogPosts.map((post: BlogPost) => ({
    url: `https://riescade.com/blog/${post.slug}`,
    lastModified:
      post.updated_at || post.published_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Excluir explicitamente caminhos de imagens opengraph
  const filteredEntries = blogEntries.filter(
    (entry) => !entry.url.includes("opengraph-image")
  );

  // Outras páginas do site
  const routes = [
    {
      url: "https://riescade.com",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: "https://riescade.com/blog",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: "https://riescade.com/sobre",
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    // Adicione outras páginas importantes do seu site
  ];

  return [...routes, ...filteredEntries];
}
