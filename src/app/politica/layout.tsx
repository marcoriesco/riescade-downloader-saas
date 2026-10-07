import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a RIESCADE coleta, usa e protege seus dados no site e nos aplicativos.",
  alternates: { canonical: "/politica" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
