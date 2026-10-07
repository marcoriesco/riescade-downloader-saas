import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade do Quiz Gamer",
  description: "Política de privacidade do aplicativo Quiz Gamer.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
