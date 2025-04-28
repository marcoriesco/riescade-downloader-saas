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

        // Usar a nova rota static-image para qualquer tipo de imagem
        // Isso garante acesso consistente em todos os ambientes
        const staticImagePath = imagePath.replace(/^\//, "");
        directImageUrl = `https://www.riescade.com.br/api/static-image/${staticImagePath}`;

        console.log("Usando rota static-image para:", staticImagePath);
      } else {
        // URL absoluta, usar diretamente
        directImageUrl = imagePath;
      }

      // Limpar a URL (remover espaços, etc)
      const imageUrl = directImageUrl.trim();

      // Testar se a imagem existe
      fetch(imageUrl, { method: "HEAD" })
        .then((response) => {
          if (!response.ok) {
            console.warn("Imagem OG não acessível, usando fallback:", imageUrl);
          } else {
            console.log("Imagem OG confirmada acessível:", imageUrl);
          }
        })
        .catch(() => {
          console.warn(
            "Erro ao verificar imagem OG, usando fallback:",
            imageUrl
          );
        });

      // URL de fallback caso a imagem não possa ser carregada
      const fallbackUrl = `https://www.riescade.com.br/api/og-fallback?title=${encodeURIComponent(
        post.title
      )}`;

      console.log("OpenGraph image URL:", imageUrl);

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
      // Fallback direto para a rota de imagem gerada em caso de erro
      const fallbackUrl = `https://www.riescade.com.br/api/og-fallback?title=${encodeURIComponent(
        post.title
      )}`;

      // Retornar configuração de fallback
      return {
        ...baseMetadata,
        openGraph: {
          title: post.title,
          description: post.excerpt || post.title,
          url: `https://www.riescade.com.br/blog/${resolvedParams.slug}`,
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
  }

  // Retorna apenas os metadados básicos se não houver imagem
  return baseMetadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
