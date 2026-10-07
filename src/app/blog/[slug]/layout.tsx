import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/blog-service";

const SITE_URL = "https://www.riescade.com.br";

function absoluteImage(path: string) {
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^\//, "");
  return `${SITE_URL}/${clean.includes("images/") ? clean : `images/${clean}`}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Artigo não encontrado", robots: { index: false, follow: true } };
  }

  const url = `${SITE_URL}/blog/${slug}`;
  const description = post.excerpt || post.title;
  const image = post.cover_image
    ? absoluteImage(post.cover_image)
    : `${SITE_URL}/api/og-fallback?title=${encodeURIComponent(post.title)}`;

  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: "RIESCADE",
      locale: "pt_BR",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? post.published_at ?? undefined,
      section: post.category,
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
