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

  // Use the cover image directly as it's within the project
  const defaultImage = "/images/og-image.webp";
  const coverImage = post.cover_image || defaultImage;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [coverImage],
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : [],
      tags: post.tags,
      siteName: "RIESCADE",
      url: `/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [coverImage],
      creator: "@riescade",
      site: "@riescade",
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}
