import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e condições",
  description: "Termos e condições de uso do site, da assinatura e dos aplicativos RIESCADE.",
  alternates: { canonical: "/termos" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
