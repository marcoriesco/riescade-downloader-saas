import { Metadata } from "next";
import platformsData from "@/data/platforms.json";

// Define PlatformData interface
interface PlatformData {
  name: string;
  image: string;
  url: string;
  fullName: string;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { platform: string };
}): Promise<Metadata> {
  const { platform } = params;
  const platformInfo = (platformsData as PlatformData[]).find(
    (p) => p.name === platform
  );

  if (!platformInfo) {
    return {
      title: "Plataforma não encontrada",
    };
  }

  return {
    title: `${platformInfo.fullName} - RIESCADE`,
    description: `Explore jogos e emuladores de ${platformInfo.fullName} disponíveis na RIESCADE.`,
    openGraph: {
      title: `${platformInfo.fullName} - RIESCADE`,
      description: `Explore jogos e emuladores de ${platformInfo.fullName} disponíveis na RIESCADE.`,
      images: [platformInfo.image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${platformInfo.fullName} - RIESCADE`,
      description: `Explore jogos e emuladores de ${platformInfo.fullName} disponíveis na RIESCADE.`,
      images: [platformInfo.image],
    },
  };
}
