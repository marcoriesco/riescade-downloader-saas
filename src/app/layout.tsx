import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const roboto = Roboto({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RIESCADE Platform - Mais de 250 Plataformas de Retrogames",
  description:
    "Acesso à mais de 250 plataformas de games, consoles e arcades clássicos em um único lugar. RIESCADE™ RetroGames e Games, sempre emulando...",
  keywords: [
    "retrogames",
    "arcade",
    "emulador",
    "jogos clássicos",
    "jogos retro",
    "Nintendo",
    "PlayStation",
    "Atari",
    "SEGA",
  ],
  authors: [{ name: "RIESCADE", url: "https://www.riescade.com.br" }],
  creator: "RIESCADE",
  publisher: "RIESCADE",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.riescade.com.br",
    siteName: "RIESCADE Platform",
    title: "RIESCADE - A Maior Plataforma de Retrogames do Brasil",
    description:
      "Acesso à mais de 250 plataformas de games, consoles e arcades clássicos em um único lugar.",
    images: [
      {
        url: "https://www.riescade.com.br/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "RIESCADE Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RIESCADE - A Maior Plataforma de Retrogames do Brasil",
    description: "Acesso à mais de 250 plataformas de games em um único lugar.",
    images: ["https://www.riescade.com.br/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://www.riescade.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
    <head>
      <meta name="6a97888e-site-verification" content="a16de362b88b6fd7387afa5f4d6eba80"></meta>
      <meta name="google-adsense-account" content="ca-pub-4909414903460614"></meta>
    </head>
      <body className={`${roboto.className} pt-20`}>
        <Analytics />
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
