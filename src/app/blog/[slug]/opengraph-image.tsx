import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog-service";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Blog post preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const post = await getBlogPostBySlug(params.slug);

    // Se não houver post ou se o post não tiver imagem de capa, retorna null
    if (!post || !post.cover_image) {
      return null;
    }

    // Usa a imagem de capa diretamente se existir
    if (post.cover_image) {
      // Retorna null para permitir que o Next.js use a imagem de capa diretamente
      return null;
    }

    // Esse código nunca será alcançado devido ao retorno anterior,
    // mas mantemos para mostrar como seria a geração da imagem se necessário no futuro
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 50,
            color: "white",
            background: "linear-gradient(to bottom, #151515, #303030)",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 30, color: "#ff0884" }}>RIESCADE Blog</div>
          </div>

          <div style={{ fontWeight: "bold", marginTop: 80, maxWidth: "80%" }}>
            {post.title}
          </div>

          <div style={{ display: "flex", marginTop: 40 }}>
            <div
              style={{
                fontSize: 24,
                backgroundColor: "#ff0884",
                color: "white",
                padding: "8px 16px",
                borderRadius: 20,
              }}
            >
              {post.category}
            </div>

            <div
              style={{
                fontSize: 24,
                marginLeft: 20,
                display: "flex",
                alignItems: "center",
                color: "#ccc",
              }}
            >
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString()
                : "Unpublished"}
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch {
    // Em caso de erro, retorna null para não exibir imagem alguma
    return null;
  }
}
