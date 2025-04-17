import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plataformas - RIESCADE",
  description:
    "Navegue por todas as plataformas de jogos disponíveis no RIESCADE, desde consoles retrô até sistemas modernos.",
  openGraph: {
    title: "Plataformas - RIESCADE",
    description:
      "Navegue por todas as plataformas de jogos disponíveis no RIESCADE, desde consoles retrô até sistemas modernos.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plataformas - RIESCADE",
    description:
      "Navegue por todas as plataformas de jogos disponíveis no RIESCADE, desde consoles retrô até sistemas modernos.",
  },
};

export default function PlatformsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
