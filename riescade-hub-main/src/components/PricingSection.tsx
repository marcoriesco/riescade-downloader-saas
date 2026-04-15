import { Check, Sparkles } from "lucide-react";

const benefits = [
  "12TB de Jogos — Download ilimitado",
  "Google Drive — Acesso integrado",
  "Comunidade VIP — Suporte prioritário",
  "250+ Plataformas — Atari até Switch",
  "RetroAchievements + Scraping automático",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--surface))_0%,transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
            // ACESSO
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
            {/* Corner decorations */}
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

              <a
                href="https://www.riescade.com.br/#pricing"
                className="mt-10 w-full h-14 flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-xl uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)]"
              >
                Assinar Agora
              </a>
              <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
                Processo 100% seguro. Cancele quando quiser.
              </p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-8 p-6 border border-border bg-surface/30 text-center">
            <p className="text-sm text-muted-foreground italic">
              "O melhor sistema de retrogames que já usei. Vale cada centavo pela experiência nostálgica!"
            </p>
            <span className="text-xs text-primary font-mono mt-3 block">— Membro desde 2023</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
