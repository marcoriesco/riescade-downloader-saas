import { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/blog-service";

type Props = {
  children: React.ReactNode;
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | RIESCADE Blog",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | RIESCADE`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `https://riescade.com/blog/${post.slug}`,
      siteName: "RIESCADE Blog",
      images: post.cover_image
        ? [
            {
              url: post.cover_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover_image ? [post.cover_image] : [],
    },
    alternates: {
      canonical: `https://riescade.com/blog/${post.slug}`,
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
