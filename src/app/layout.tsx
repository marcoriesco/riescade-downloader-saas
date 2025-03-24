import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { Analytics } from "@vercel/analytics/react";

const roboto = Roboto({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RIESCADE Platform",
  description: "RIESCADE™ RetroGames e Games, sempre emulando...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Analytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
