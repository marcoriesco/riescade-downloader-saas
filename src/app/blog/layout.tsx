import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | RIESCADE",
  description: "Novidades, guias e dicas sobre games retro e emulação",
  openGraph: {
    title: "Blog RIESCADE",
    description: "Novidades, guias e dicas sobre games retro e emulação",
    url: "https://riescade.com/blog",
    siteName: "RIESCADE Blog",
    images: [
      {
        url: "/images/blog-og.webp",
        width: 1200,
        height: 630,
        alt: "RIESCADE Blog",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog RIESCADE",
    description: "Novidades, guias e dicas sobre games retro e emulação",
    images: ["/images/blog-og.webp"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
