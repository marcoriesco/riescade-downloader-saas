import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exclusão de dados",
  description: "Como solicitar a exclusão da sua conta e dos seus dados da RIESCADE.",
  alternates: { canonical: "/app-data" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
