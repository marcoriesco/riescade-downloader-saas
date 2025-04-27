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
      title: "Postagem não encontrada | RIESCADE",
      description: "A postagem de blog solicitada não pôde ser encontrada.",
    };
  }

  // Metadata simples sem opengraph ou twitter card
  const baseMetadata: Metadata = {
    title: `${post.title} | RIESCADE`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `https://riescade.com/blog/${resolvedParams.slug}`,
    },
    // Desativar explicitamente a geração automática de OpenGraph
    openGraph: null,
    twitter: null,
  };

  // Adiciona opengraph e twitter card apenas se houver imagem de capa
  if (post.cover_image) {
    // Certifique-se de que a URL é absoluta
    const imageUrl = post.cover_image.startsWith("http")
      ? post.cover_image
      : `https://riescade.com${post.cover_image}`;

    return {
      ...baseMetadata,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        url: `https://riescade.com/blog/${resolvedParams.slug}`,
        siteName: "RIESCADE",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || post.title,
        images: [imageUrl],
      },
    };
  }

  // Retorna apenas os metadados básicos se não houver imagem
  return baseMetadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
