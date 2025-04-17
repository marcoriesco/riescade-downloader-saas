import { Metadata } from "next";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categorySlug = params.slug;
  // Convert slug to readable format (e.g., "retro-gaming" to "Retro Gaming")
  const categoryName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${categoryName} | Blog RIESCADE`,
    description: `Artigos sobre ${categoryName.toLowerCase()} - Novidades, guias e dicas sobre games retro e emulação`,
    openGraph: {
      title: `${categoryName} | Blog RIESCADE`,
      description: `Artigos sobre ${categoryName.toLowerCase()} - Novidades, guias e dicas sobre games retro e emulação`,
      url: `https://riescade.com/blog/category/${categorySlug}`,
      siteName: "RIESCADE Blog",
      images: [
        {
          url: "/images/blog-og.webp",
          width: 1200,
          height: 630,
          alt: `${categoryName} | RIESCADE Blog`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | Blog RIESCADE`,
      description: `Artigos sobre ${categoryName.toLowerCase()} - Novidades, guias e dicas sobre games retro e emulação`,
      images: ["/images/blog-og.webp"],
    },
  };
}
