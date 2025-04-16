import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Platforms - RIESCADE",
  description:
    "Browse all gaming platforms available on RIESCADE, from retro consoles to modern systems.",
  openGraph: {
    title: "All Platforms - RIESCADE",
    description:
      "Browse all gaming platforms available on RIESCADE, from retro consoles to modern systems.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Platforms - RIESCADE",
    description:
      "Browse all gaming platforms available on RIESCADE, from retro consoles to modern systems.",
  },
};

export default function PlatformsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
