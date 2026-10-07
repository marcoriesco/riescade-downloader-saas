import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Cpu,
  Download,
  Factory,
  Gamepad2,
  Library,
  LogIn,
  Play,
} from "lucide-react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  PLATFORMS,
  getPlatform,
  getPlatformGameCounts,
  relatedPlatforms,
  type Platform,
} from "@/lib/platforms";

export const revalidate = 86400;

const SITE_URL = "https://www.riescade.com.br";

export function generateStaticParams() {
  return PLATFORMS.map((platform) => ({ platform: platform.slug }));
}

function describe(platform: Platform) {
  const year = platform.content?.year ? ` (${platform.content.year})` : "";
  return `Jogue ${platform.name}${year} no PC com o RIESCADE OS: emulador configurado, biblioteca com capas e downloads integrados. Funciona com controle no Windows.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const platform = getPlatform((await params).platform);
  if (!platform) return { title: "Plataforma não encontrada", robots: { index: false } };

  const title = `Jogue ${platform.name} no PC`;
  const description = describe(platform);
  const image = platform.image ?? platform.logo ?? "/images/og-image.webp";
  return {
    title,
    description,
    alternates: { canonical: `/platforms/${platform.slug}` },
    robots: { index: platform.indexable, follow: true },
    openGraph: { type: "website", url: `/platforms/${platform.slug}`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function faqFor(platform: Platform) {
  const bios = platform.content?.bios;
  return [
    {
      q: `Dá para jogar ${platform.name} no PC?`,
      a: `Sim. O RIESCADE OS reúne o emulador de ${platform.name} já configurado, organiza seus jogos com capas e informações e inicia tudo com um clique, usando controle, teclado ou mouse no Windows.`,
    },
    {
      q: `Preciso de BIOS para jogar ${platform.name}?`,
      a: bios
        ? `Sim, ${platform.name} precisa de arquivos de BIOS ou firmware. No RIESCADE OS, os membros instalam o pacote completo de BIOS com um clique em Configurações → Downloads.`
        : `Na maioria dos casos, não. Os jogos de ${platform.name} rodam direto no emulador, sem arquivos de BIOS adicionais.`,
    },
    {
      q: "Posso jogar com controle?",
      a: "Sim. O RIESCADE OS detecta controles XInput, DirectInput e HID automaticamente e configura cada emulador, sem precisar mapear botões manualmente.",
    },
    {
      q: "Quanto custa?",
      a: "O RIESCADE OS é gratuito. A assinatura de R$ 30 por mês, sem fidelidade, libera os downloads de jogos e mídias dentro do aplicativo, o pacote de BIOS e o suporte VIP.",
    },
  ];
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const platform = getPlatform((await params).platform);
  if (!platform) notFound();

  const counts = await getPlatformGameCounts();
  const games = counts[platform.slug] ?? 0;
  const related = relatedPlatforms(platform);
  const faqs = faqFor(platform);
  const art = platform.image ?? platform.logo;
  const facts = [
    platform.content?.maker && { icon: Factory, label: "Fabricante", value: platform.content.maker },
    platform.content?.year && { icon: CalendarDays, label: "Lançamento", value: String(platform.content.year) },
    platform.kindLabel && { icon: Gamepad2, label: "Tipo", value: platform.kindLabel },
    games > 0 && { icon: Library, label: "No catálogo", value: `${games.toLocaleString("pt-BR")} jogos` },
    { icon: Cpu, label: "BIOS", value: platform.content?.bios ? "Necessária" : "Não precisa" },
  ].filter(Boolean) as { icon: typeof Factory; label: string; value: string }[];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Plataformas", item: `${SITE_URL}/platforms` },
        { "@type": "ListItem", position: 3, name: platform.name, item: `${SITE_URL}/platforms/${platform.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-6 pb-24 pt-32 md:px-12">
        <nav aria-label="Navegação estrutural" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">Início</Link>
          <ChevronRight aria-hidden="true" className="size-3" />
          <Link href="/platforms" className="hover:text-primary">Plataformas</Link>
          <ChevronRight aria-hidden="true" className="size-3" />
          <span>{platform.name}</span>
        </nav>

        {/* HERO */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {platform.kindLabel && (
              <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">
                {platform.kindLabel}
              </span>
            )}
            <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Jogue <span className="text-gradient-primary">{platform.name}</span> no PC
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {platform.content?.summary ??
                `Os jogos de ${platform.name} organizados na biblioteca do RIESCADE OS, prontos para jogar no Windows com controle.`}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-primary bg-primary px-8 font-display text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_45px_hsl(var(--primary)/0.36)] transition-all hover:-translate-y-1 hover:bg-accent"
              >
                <Download className="size-5" />
                Baixar RIESCADE OS
              </Link>
              <Link
                href="/tutorial"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-white/30 bg-black/40 px-8 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:border-primary hover:bg-primary/10"
              >
                <Play className="size-5" />
                Como instalar
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.06] p-8">
            <div className="grid-overlay absolute inset-0 opacity-30" />
            <div className="relative flex aspect-[4/3] items-center justify-center">
              {art ? (
                <Image
                  src={art}
                  alt={platform.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <Gamepad2 className="size-24 text-primary" />
              )}
            </div>
          </div>
        </section>

        {/* FICHA */}
        <section aria-label={`Ficha do ${platform.name}`} className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-5">
              <fact.icon className="size-4 text-primary" />
              <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{fact.label}</p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">{fact.value}</p>
            </div>
          ))}
        </section>

        {/* COMO JOGAR */}
        <section className="mt-20">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">Passo a passo</span>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            Como jogar {platform.name} <span className="text-gradient-primary">no PC</span>
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: Download, title: "Baixe o RIESCADE OS", text: "Gratuito para Windows. Extraia o arquivo e abra o RIESCADE.exe." },
              {
                icon: LogIn,
                title: "Entre com sua conta",
                text: platform.content?.bios
                  ? `Entre com Google e instale o pacote de BIOS em Configurações → Downloads. ${platform.name} precisa dele.`
                  : "Entre com sua conta Google em Configurações → Minha Conta para liberar os downloads.",
              },
              { icon: Gamepad2, title: `Escolha e jogue`, text: `Abra ${platform.name} na biblioteca, baixe o jogo e jogue com controle. O emulador é configurado automaticamente.` },
            ].map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-6">
                <div className="flex items-center gap-3">
                  <span className="glow-primary flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="size-4 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold uppercase text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>

          {platform.extensions.length > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Formatos reconhecidos:</span>{" "}
              {platform.extensions.map((ext) => (
                <code key={ext} className="mr-1.5 rounded-md border border-border bg-black/40 px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {ext}
                </code>
              ))}
            </p>
          )}
        </section>

        {/* CTA */}
        <section className="relative mt-20 overflow-hidden rounded-3xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-background/90 p-8 md:p-12">
          <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-primary" />
          <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-primary" />
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary" />
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-bold uppercase text-foreground">
                {games > 0 ? `${games.toLocaleString("pt-BR")} jogos de ${platform.name}` : platform.name}{" "}
                <span className="text-gradient-primary">a um clique</span>
              </h2>
              <ul className="mt-6 space-y-3">
                {["Downloads de jogos e mídias dentro do aplicativo", "Pacote completo de BIOS", "Mais de 250 plataformas na mesma biblioteca", "Suporte VIP no WhatsApp e no Telegram"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-primary/50 bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-right">
              <p className="font-display text-5xl font-bold text-foreground">
                R$ 30<span className="font-mono text-sm font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Sem fidelidade. Cancele quando quiser.</p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-xl bg-primary font-display text-lg font-bold uppercase tracking-[0.15em] text-white transition-all hover:scale-[1.02] hover:bg-accent md:w-auto md:px-10"
              >
                Assinar agora
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="mt-20 max-w-4xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">Dúvidas</span>
          <h2 id="faq-title" className="mb-8 mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground">
            Perguntas <span className="text-gradient-primary">frequentes</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-5 open:border-primary/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  <span className="flex items-center gap-3">
                    <CircleHelp className="size-4 shrink-0 text-primary" />
                    {faq.q}
                  </span>
                  <span className="text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 pl-7 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* RELACIONADAS */}
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-20">
            <h2 id="related-title" className="mb-6 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Veja também
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={`/platforms/${other.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-card/60 p-4 transition-colors hover:border-primary/40"
                >
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary">{other.name}</span>
                  <span className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {other.content?.year ?? other.kindLabel}
                    <ArrowUpRight className="size-3.5" />
                  </span>
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
