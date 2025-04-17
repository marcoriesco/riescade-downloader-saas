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

  // Get the full URL for the cover image
  const coverImageUrl = post.cover_image
    ? post.cover_image.startsWith("http")
      ? post.cover_image
      : `${process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br"}${
          post.cover_image
        }`
    : `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br"
      }/images/og-image.webp`;

  // Prepare image array for OpenGraph and Twitter
  const images = post.cover_image
    ? [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: "image/jpeg",
        },
      ]
    : [
        {
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br"
          }/images/og-image.webp`,
          width: 1200,
          height: 630,
          alt: "RIESCADE Blog",
          type: "image/webp",
        },
      ];

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: images,
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : [],
      tags: post.tags,
      siteName: "RIESCADE",
      url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br"
      }/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: images,
      creator: "@riescade",
      site: "@riescade",
    },
    alternates: {
      canonical: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://riescade.com.br"
      }/blog/${post.slug}`,
    },
  };
}
