import { Star } from "lucide-react";

const testimonials = [
  { name: "Marcos Silva", time: "2 meses atrás", text: "Incrível! Consegui acessar vários jogos de consoles antigos que não encontrava em nenhum outro lugar. A interface é muito intuitiva e o acesso ao Google Drive é rápido." },
  { name: "Ana Cardoso", time: "3 meses atrás", text: "Vale cada centavo! Meus filhos adoraram jogar os mesmos jogos que eu jogava quando era criança. Recomendo a todos os amantes de games retro." },
  { name: "Rafael Mendes", time: "1 mês atrás", text: "Excelente plataforma! O suporte foi super atencioso e resolveu rapidamente qualquer dúvida que tive." },
  { name: "Juliana Costa", time: "2 semanas atrás", text: "A melhor forma de reviver os clássicos! A quantidade de plataformas disponíveis é impressionante." },
  { name: "Pedro Almeida", time: "1 mês atrás", text: "Sensacional! Finalmente um serviço que reúne tantas plataformas em um só lugar. A organização é perfeita." },
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
            // DEPOIMENTOS
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
            O Que Nossos <span className="text-gradient-primary">Colaboradores</span> Dizem
          </h2>
          <p className="mt-4 text-muted-foreground">
            Avaliações reais de usuários satisfeitos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-border bg-background/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 border border-primary/30 bg-surface flex items-center justify-center font-display font-bold text-primary text-lg">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-foreground uppercase">{t.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{t.time}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              <div className="mt-4 font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                Avaliação do Google
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
