import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar no aplicativo",
  description: "Login da conta RIESCADE para os aplicativos.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
