import { Gamepad2, Zap, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center grid-overlay">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,hsl(var(--surface))_0%,transparent_60%)]" />
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 py-24">
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col justify-center items-start">
          {/* Status badge */}
          <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-surface/80 border border-primary/40 backdrop-blur-sm glow-primary">
            <div className="size-2 bg-primary rounded-full animate-pulse" style={{ boxShadow: "0 0 8px hsl(var(--primary))" }} />
            <span className="font-mono text-[10px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]">
              Rede Global Ativa
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 font-display text-6xl sm:text-7xl lg:text-[5.5rem] font-bold uppercase leading-[0.85] tracking-tight text-balance drop-shadow-lg text-foreground">
            O Melhor <br />
            <span className="text-gradient-primary">Dos Retrogames</span>
          </h1>

          <p className="mt-6 max-w-[55ch] text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
            Acesso à mais de 250 plataformas de games, consoles e arcades clássicos em um único lugar. Emulação perfeita com interface premium.
          </p>

          {/* Stats grid */}
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

          {/* CTA & trust */}
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
            <a
              href="#pricing"
              className="relative group h-14 px-8 inline-flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-xl uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] shrink-0"
            >
              <div className="absolute inset-0 border-2 border-foreground/20 group-hover:border-foreground/50 transition-colors" />
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground" />
              <span className="relative z-10 drop-shadow-md">Começar Agora</span>
            </a>

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

        {/* Right Visual */}
        <div className="lg:col-span-5 relative h-[400px] lg:h-[700px] w-full mt-8 lg:mt-0 hidden md:block">
          {/* Main panel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] aspect-[4/3] bg-panel border-2 border-primary/50 p-2 z-30 transition-transform duration-700 hover:scale-105" style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.25)" }}>
            <div className="w-full h-full bg-card relative overflow-hidden group">
              <img
                src="https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Farcade.webp&w=1080&q=75"
                loading="lazy"
                alt="Interface Arcade RIESCADE"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
              />
              <div className="absolute inset-0 scanlines pointer-events-none mix-blend-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent border-t border-primary/20">
                <div className="font-display font-bold text-lg uppercase tracking-wider text-foreground">Arcade Classic</div>
                <div className="font-mono text-primary text-[10px] mt-1">250+ SISTEMAS // ONLINE</div>
              </div>
            </div>
          </div>

          {/* Floating card top-left */}
          <div className="absolute top-[5%] left-[5%] w-[200px] sm:w-[240px] aspect-[4/3] bg-panel border border-accent/30 p-1 -rotate-6 z-10" style={{ boxShadow: "0 0 30px hsl(var(--accent) / 0.15)" }}>
            <div className="w-full h-full bg-card overflow-hidden">
              <img
                src="https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fsf3.webp&w=1080&q=75"
                loading="lazy"
                alt="Street Fighter III"
                className="w-full h-full object-cover opacity-50 grayscale"
              />
            </div>
          </div>

          {/* Floating card bottom-right */}
          <div className="absolute bottom-[5%] right-[0%] w-[220px] sm:w-[260px] aspect-square bg-panel border border-primary/20 p-1 rotate-6 z-20" style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.1)" }}>
            <div className="w-full h-full bg-card overflow-hidden relative">
              <img
                src="https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fswitch.webp&w=1080&q=75"
                loading="lazy"
                alt="Nintendo Switch"
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
  );
};

export default HeroSection;
