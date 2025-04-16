import { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/blog-service";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post não encontrado",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : [],
      tags: post.tags,
      siteName: "RIESCADE",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      creator: "@riescade",
      site: "@riescade",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
  };
}
