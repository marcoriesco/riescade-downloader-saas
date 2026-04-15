import { Zap, Gamepad2, Users, Monitor, Download, Trophy } from "lucide-react";

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

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--surface))_0%,transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
            // RECURSOS
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
            <div
              key={feature.title}
              className="bg-background p-8 group hover:bg-surface/50 transition-colors duration-300"
            >
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
  );
};

export default FeaturesSection;
