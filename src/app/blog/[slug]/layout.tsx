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

  // URL base para links
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.riescade.com.br";

  // Metadata básica que será usada em todos os casos
  const baseMetadata: Metadata = {
    title: `${post.title} | RIESCADE`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `${baseUrl}/blog/${resolvedParams.slug}`,
    },
  };

  // Fallback URL para quando não houver imagem específica
  const fallbackUrl = `${baseUrl}/api/og-fallback?title=${encodeURIComponent(
    post.title
  )}`;

  // Se tem imagem de capa, usar como imagem principal do OpenGraph
  if (post.cover_image) {
    try {
      // Processar a URL da imagem para garantir acesso direto
      let imagePath = post.cover_image;
      let directImageUrl = "";

      if (!imagePath.startsWith("http")) {
        // Remover "/" inicial se existir
        if (imagePath.startsWith("/")) {
          imagePath = imagePath.substring(1);
        }

        // Se o caminho não inclui "images/", adicionar
        if (!imagePath.includes("images/") && !imagePath.includes("_next/")) {
          imagePath = `images/${imagePath}`;
        }

        // URL DIRETA para a imagem (sem passar por static-image)
        directImageUrl = `${baseUrl}/${imagePath}`;

        // Apenas para depuração, mostrar o caminho
        console.log("URL direta da imagem:", directImageUrl);
      } else {
        // URL absoluta, usar diretamente
        directImageUrl = imagePath;
      }

      // Limpar a URL (remover espaços, etc)
      const imageUrl = directImageUrl.trim();

      console.log("OpenGraph image URL:", imageUrl);

      return {
        ...baseMetadata,
        openGraph: {
          title: post.title,
          description: post.excerpt || post.title,
          url: `${baseUrl}/blog/${resolvedParams.slug}`,
          siteName: "RIESCADE",
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
            // Fallback image como segunda opção
            {
              url: fallbackUrl,
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
          images: [imageUrl, fallbackUrl],
        },
      };
    } catch (e) {
      console.error("Erro ao processar URL da imagem:", e);
    }
  }

  // Retornar configuração com fallback ou sem imagem de capa
  return {
    ...baseMetadata,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `${baseUrl}/blog/${resolvedParams.slug}`,
      siteName: "RIESCADE",
      images: [
        {
          url: fallbackUrl,
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
      images: [fallbackUrl],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
