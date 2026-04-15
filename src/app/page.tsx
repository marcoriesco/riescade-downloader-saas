"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Zap, Trophy, Gamepad2, Shield, Users, 
  Monitor, Download, Sparkles, Check 
} from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BlogPostsPreview from "@/components/BlogPostsPreview";
import { GoogleReviews } from "@/components/GoogleReviews";

const screenshots = [
  { src: "/screenshots/loading.webp", title: "Loading", subtitle: "RIESCADE" },
  { src: "/screenshots/allgames.webp", title: "Jogos", subtitle: "RIESCADE" },
  { src: "/screenshots/emulators.webp", title: "Emuladores", subtitle: "RIESCADE" },
  { src: "/screenshots/arcade.webp", title: "Arcade", subtitle: "RIESCADE" },
  { src: "/screenshots/sf3.webp", title: "Street Fighter III", subtitle: "Arcade" },
  { src: "/screenshots/switch.webp", title: "Nintendo Switch", subtitle: "Consoles" },
  { src: "/screenshots/mariowonder.webp", title: "Super Mario Bros. Wonder", subtitle: "Nintendo Switch" },
  { src: "/screenshots/windows.webp", title: "Windows", subtitle: "PC Gamer" },
  { src: "/screenshots/n64dd.webp", title: "Nintendo 64 Disk", subtitle: "Extensões" },
  { src: "/screenshots/psvita.webp", title: "PS Vita", subtitle: "Portáteis" },
  { src: "/screenshots/pinballm.webp", title: "Pinball M", subtitle: "Pinballs" },
  { src: "/screenshots/doom3.webp", title: "DOOM 3", subtitle: "Ports" },
];

const features = [
  {
    icon: Zap,
    title: "Alto Desempenho",
    description: "Jogabilidade ultrarrápida com emulação otimizada e latência mínima.",
  },
  {
    icon: Gamepad2,
    title: "+250 Plataformas",
    description: "Do Atari ao Nintendo Switch. Todos os consoles e arcades clássicos.",
  },
  {
    icon: Users,
    title: "Comunidade VIP",
    description: "Suporte no Discord, WhatsApp e Telegram com a comunidade.",
  },
  {
    icon: Download,
    title: "Download Ilimitado",
    description: "Acesso completo a 12TB de jogos via integração com Google Drive.",
  },
  {
    icon: Trophy,
    title: "RetroAchievements",
    description: "Integração completa com RetroAchievements e scraping automático.",
  },
  {
    icon: Monitor,
    title: "5 Temas Premium",
    description: "Interface personalizável com 5 temas visuais exclusivos.",
  },
];

const benefits = [
  "12TB de Jogos — Download ilimitado",
  "Google Drive — Acesso integrado",
  "Comunidade VIP — Suporte prioritário",
  "250+ Plataformas — Atari até Switch",
  "RetroAchievements + Scraping automático",
];

export default function Home() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginRedirect = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        router.push("/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Erro ao iniciar login:", error);
        setIsLoggingIn(false);
      } else if (data) {
        console.log("Login iniciado com sucesso, URL:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoggingIn(false);
    }
  }, [isLoggingIn, router]);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        {/* HERO SECTION */}
        <section className="relative min-h-screen overflow-hidden flex items-center grid-overlay mt-[-4rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,hsl(var(--surface))_0%,transparent_60%)]" />
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pt-18 pb-24">
            <div className="lg:col-span-7 flex flex-col justify-center items-start">

              <h1 className="mt-8 font-display text-4xl sm:text-6xl lg:text-[4.5rem] font-bold uppercase leading-[0.85] tracking-tight text-balance drop-shadow-lg text-foreground">
                O Melhor <span className="text-gradient-primary text-7xl">Dos Retrogames</span>
              </h1>

              <p className="mt-6 max-w-[55ch] text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                Acesso à mais de 250 plataformas de games, consoles e arcades clássicos em um único lugar. Emulação perfeita com interface premium.
              </p>

              <div className="mt-10 w-full max-w-2xl grid grid-cols-3 gap-[1px] bg-primary/30 p-[1px]" style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}>
                <div className="bg-background/90 backdrop-blur-md px-4 py-5 sm:p-6 flex flex-col">
                  <span className="font-mono text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                    250<span className="text-primary">+</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1">Plataformas</span>
                </div>
                <div className="bg-background/90 backdrop-blur-md px-4 py-5 sm:p-6 flex flex-col">
                  <span className="font-mono text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                    12<span className="text-accent">TB</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1">Acervo de Jogos</span>
                </div>
                <div className="bg-background/90 backdrop-blur-md px-4 py-5 sm:p-6 flex flex-col">
                  <span className="font-mono text-2xl sm:text-4xl font-bold text-foreground tracking-tight">5</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1">Temas Premium</span>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
                <button
                  onClick={handleLoginRedirect}
                  className="relative group h-14 px-8 inline-flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-xl uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] shrink-0"
                >
                  <div className="absolute inset-0 border-2 border-foreground/20 group-hover:border-foreground/50 transition-colors" />
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground" />
                  <span className="relative z-10 drop-shadow-md">
                    {isLoggingIn ? "Carregando..." : "Começar Agora"}
                  </span>
                </button>

                <div className="flex flex-col gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Zap className="size-3 text-accent" />
                    <span>Emulação Perfeita</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="size-3 text-muted-foreground" />
                    <span>Cancele Quando Quiser</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-[400px] lg:h-[700px] w-full mt-8 lg:mt-0 hidden md:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] aspect-[4/3] bg-panel border-2 border-primary/50 p-2 z-30 transition-transform duration-700 hover:scale-105" style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.25)" }}>
                <div className="w-full h-full bg-card relative overflow-hidden group">
                  <Image
                    src="/screenshots/arcade.webp"
                    alt="Interface Arcade RIESCADE"
                    fill
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                  />
                  <div className="absolute inset-0 scanlines pointer-events-none mix-blend-overlay" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent border-t border-primary/20">
                    <div className="font-display font-bold text-lg uppercase tracking-wider text-foreground">Arcade Classic</div>
                    <div className="font-mono text-primary text-[10px] mt-1">250+ SISTEMAS // ONLINE</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-[5%] left-[5%] w-[200px] sm:w-[240px] aspect-[4/3] bg-panel border border-accent/30 p-1 -rotate-6 z-10" style={{ boxShadow: "0 0 30px hsl(var(--accent) / 0.15)" }}>
                <div className="w-full h-full bg-card overflow-hidden">
                  <Image
                    src="/screenshots/sf3.webp"
                    alt="Street Fighter III"
                    fill
                    className="w-full h-full object-cover opacity-50 grayscale"
                  />
                </div>
              </div>

              <div className="absolute bottom-[5%] right-[0%] w-[220px] sm:w-[260px] aspect-square bg-panel border border-primary/20 p-1 rotate-6 z-20" style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.1)" }}>
                <div className="w-full h-full bg-card overflow-hidden relative">
                  <Image
                    src="/screenshots/switch.webp"
                    alt="Nintendo Switch"
                    fill
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-background/80 border border-primary/30 font-mono text-[9px] text-primary uppercase">
                    Switch
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--surface))_0%,transparent_50%)]" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
                RECURSOS
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
                Recursos de <span className="text-gradient-primary">Games</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Projetado para amantes de jogos retro e arcade clássico
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border/50">
              {features.map((feature) => (
                <div key={feature.title} className="bg-background p-8 group hover:bg-surface/50 transition-colors duration-300">
                  <div className="size-12 border border-primary/30 flex items-center justify-center mb-6 group-hover:border-primary/60 transition-colors glow-primary">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCREENSHOTS SECTION */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
                MULTISISTEMA
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
                Mais de 250 <span className="text-gradient-primary">Sistemas</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Mais de 250 sistemas em um único lugar
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((shot) => (
                <div key={shot.title} className="group relative bg-panel border border-border overflow-hidden hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-video overflow-hidden relative w-full h-full">
                    <Image
                      src={shot.src}
                      alt={shot.title}
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 scanlines pointer-events-none mix-blend-overlay opacity-30" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
                    <div className="font-display font-bold text-sm uppercase text-foreground">{shot.title}</div>
                    <div className="font-mono text-[10px] text-primary uppercase">{shot.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--surface))_0%,transparent_50%)]" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
                ACESSO
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
                Potencialize Sua <span className="text-gradient-primary">Experiência</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                A melhor experiência de jogos retro aguarda por você
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="relative border-2 border-primary/50 bg-background/80 backdrop-blur-sm overflow-hidden animate-pulse-glow">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="size-5 text-primary" />
                    <span className="font-mono text-xs text-primary uppercase tracking-widest font-bold">Riescade Membro</span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="font-display text-5xl md:text-6xl font-bold text-foreground">R$ 30</span>
                    <span className="text-muted-foreground font-mono text-sm">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Assinatura mensal sem fidelidade</p>

                  <div className="mt-8 space-y-4">
                    {benefits.map((b) => (
                      <div key={b} className="flex items-start gap-3">
                        <div className="size-5 border border-primary/50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="size-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/80">{b}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleLoginRedirect}
                    disabled={isLoggingIn}
                    className="mt-10 w-full h-14 flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-xl uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] disabled:opacity-70 disabled:cursor-not-allowed rounded-none"
                  >
                    {isLoggingIn ? "Carregando..." : "Assinar Agora"}
                  </button>
                  <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
                    Processo 100% seguro. Cancele quando quiser.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 border border-border bg-surface/30 text-center">
                <p className="text-sm text-muted-foreground italic">
                  &quot;O melhor sistema de retrogames que já usei. Vale cada centavo pela experiência nostálgica!&quot;
                </p>
                <span className="text-xs text-primary font-mono mt-3 block">— Membro desde 2023</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT SECTION */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-20" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
                PRODUTO EXCLUSIVO
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
                HD 1TB <span className="text-gradient-primary">Nintendo Switch</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Pronto para conectar e jogar imediatamente
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative border-2 border-primary/30 p-2 glow-primary">
                <Image
                  src="/images/hdswitch/hd_riescade_switch_1tb.webp"
                  alt="HD 1TB Nintendo Switch - RIESCADE"
                  width={1000}
                  height={1000}
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 scanlines pointer-events-none mix-blend-overlay opacity-20" />
              </div>

              <div className="flex flex-col gap-6">
                <h3 className="font-display text-3xl font-bold uppercase text-foreground">
                  HD 1TB Nintendo Switch
                </h3>
                <p className="text-muted-foreground">
                  Emuladores já configurados + Artes de todos os jogos. Pronto para conectar e jogar imediatamente.
                </p>

                <div className="space-y-3">
                  {["Emuladores já configurados", "Artes de todos os jogos", "Instruções de instalação", "Suporte técnico"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="size-5 border border-accent/50 flex items-center justify-center">
                        <Check className="size-3 text-accent" />
                      </div>
                      <span className="text-sm text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="font-display text-4xl font-bold text-foreground">
                    R$ 350<span className="text-muted-foreground text-lg font-mono">,00</span>
                  </div>
                </div>

                <Link
                  href="/produtos/hd-switch"
                  className="w-full sm:w-auto h-14 px-10 flex items-center justify-center bg-accent text-accent-foreground font-display font-bold text-lg uppercase tracking-[0.1em] transition-all duration-300 hover:scale-[1.02] glow-accent"
                >
                  Comprar Agora
                </Link>
                <p className="text-xs text-muted-foreground font-mono">
                  Envio para todo Brasil • Pagamento seguro
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BLOG SECTION */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--surface))_0%,transparent_50%)]" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
                BLOG
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
                Blog <span className="text-gradient-primary">Riescade</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Novidades e artigos sobre o universo dos jogos retro
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <BlogPostsPreview />
            </div>

            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:text-accent transition-colors uppercase tracking-widest"
              >
                Ver todos os artigos →
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS (Google Reviews) SECTION */}
        <section className="relative py-24 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
                DEPOIMENTOS
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
                O Que Nossos <span className="text-gradient-primary">Colaboradores</span> Dizem
              </h2>
              <p className="mt-4 text-muted-foreground">
                Avaliações reais de usuários satisfeitos
              </p>
            </div>

            <GoogleReviews slidesPerView={3} />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
