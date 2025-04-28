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
      canonical: `https://www.riescade.com.br/blog/${resolvedParams.slug}`,
    },
    // Desativar explicitamente a geração automática de OpenGraph
    openGraph: null,
    twitter: null,
  };

  // Adiciona opengraph e twitter card apenas se houver imagem de capa
  if (post.cover_image) {
    // Certifique-se de que a URL é absoluta e usa o domínio correto
    // Primeiro, extraímos o caminho da imagem original removendo qualquer domínio
    let imagePath = post.cover_image;
    if (imagePath.startsWith("http")) {
      // Se já é uma URL completa, extrair só o caminho
      try {
        const url = new URL(imagePath);
        imagePath = url.pathname;
      } catch (e) {
        console.error("Erro ao processar URL da imagem:", e);
      }
    }

    // Se o caminho não começar com /, adicionar
    if (!imagePath.startsWith("/")) {
      imagePath = "/" + imagePath;
    }

    // Construir a URL completa com o domínio correto
    const imageUrl = `https://www.riescade.com.br${imagePath}`;

    return {
      ...baseMetadata,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        url: `https://www.riescade.com.br/blog/${resolvedParams.slug}`,
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
