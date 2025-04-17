import { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/blog-service";

// Props for layout metadata with params as a Promise as expected by Next.js
type LayoutProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  // Resolve the params Promise
  const { params } = props;
  const resolvedParams = await params;

  // Get the post data
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Post Not Found | RIESCADE",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | RIESCADE`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `https://riescade.com/blog/${resolvedParams.slug}`,
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
      canonical: `https://riescade.com/blog/${resolvedParams.slug}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
