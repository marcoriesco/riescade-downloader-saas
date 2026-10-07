import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageIntro, ExploreLink } from "@/components/PageIntro";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { KIND_ORDER, PLATFORMS, getPlatformGameCounts } from "@/lib/platforms";
import { PLATFORM_KIND_LABELS } from "@/data/platform-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Mais de 250 consoles, arcades e computadores para jogar no PC",
  description:
    "Todas as plataformas do RIESCADE OS: Super Nintendo, Mega Drive, PlayStation, Nintendo 64, arcades Neo Geo e CPS, computadores clássicos e muito mais, para jogar no Windows.",
  alternates: { canonical: "/platforms" },
};

const SECTION_LABELS: Record<string, string> = {
  console: "Consoles de mesa",
  portable: "Portáteis",
  arcade: "Arcades",
  computer: "Computadores",
  peripheral: "Acessórios e expansões",
  engine: "Engines e fantasy consoles",
  system: "Sistemas",
  collection: "Coleções",
};

export default async function PlatformsPage() {
  const counts = await getPlatformGameCounts();
  const featured = PLATFORMS.filter((p) => p.indexable);
  const others = PLATFORMS.filter((p) => !p.indexable);
  const sections = KIND_ORDER.map((kind) => ({
    kind,
    items: featured
      .filter((p) => p.content?.kind === kind)
      .sort((a, b) => (a.content?.year ?? 9999) - (b.content?.year ?? 9999)),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />
      <Header />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-6 pb-24 pt-32 md:px-12">
        <PageIntro
          eyebrow="Plataformas"
          title={<>Mais de 250 <span className="text-gradient-primary">sistemas.</span></>}
          description="Consoles, portáteis, arcades e computadores clássicos reunidos em uma única biblioteca para jogar no PC com controle."
        >
          <ExploreLink href="/tutorial">Como começar</ExploreLink>
        </PageIntro>

        <nav aria-label="Tipos de plataforma" className="mb-12 flex flex-wrap gap-2">
          {sections.map(({ kind, items }) => (
            <a
              key={kind}
              href={`#${kind}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {SECTION_LABELS[kind]}
              <span className="font-mono text-[10px]">{items.length}</span>
            </a>
          ))}
        </nav>

        {sections.map(({ kind, items }) => (
          <section key={kind} id={kind} aria-labelledby={`${kind}-title`} className="mb-16 scroll-mt-28">
            <h2 id={`${kind}-title`} className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
              {SECTION_LABELS[kind] ?? PLATFORM_KIND_LABELS[kind]}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((platform) => {
                const games = counts[platform.slug] ?? 0;
                return (
                  <Link
                    key={platform.slug}
                    href={`/platforms/${platform.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                  >
                    <div className="relative aspect-[4/3] bg-black/30">
                      {(platform.image ?? platform.logo) && (
                        <Image
                          src={(platform.image ?? platform.logo)!}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-grow flex-col p-4">
                      <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{platform.name}</h3>
                      <p className="mt-auto pt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {[platform.content?.maker, platform.content?.year].filter(Boolean).join(" · ")}
                        {games > 0 && <span className="block text-primary">{games.toLocaleString("pt-BR")} jogos</span>}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {others.length > 0 && (
          <section aria-labelledby="others-title" className="border-t border-border pt-10">
            <h2 id="others-title" className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Ports, hacks e outros sistemas
            </h2>
            <div className="flex flex-wrap gap-2">
              {others.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`/platforms/${platform.slug}`}
                  className="rounded-xl border border-white/10 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {platform.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
