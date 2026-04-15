import { Check } from "lucide-react";

const ProductSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
            // PRODUTO EXCLUSIVO
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
            <img
              src="https://www.riescade.com.br/_next/image?url=%2Fimages%2Fhdswitch%2Fhd_riescade_switch_1tb.webp&w=3840&q=75"
              alt="HD 1TB Nintendo Switch - RIESCADE"
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

            <a
              href="https://www.riescade.com.br/produtos/hd-switch"
              className="w-full sm:w-auto h-14 px-10 flex items-center justify-center bg-accent text-accent-foreground font-display font-bold text-lg uppercase tracking-[0.1em] transition-all duration-300 hover:scale-[1.02] glow-accent"
            >
              Comprar Agora
            </a>
            <p className="text-xs text-muted-foreground font-mono">
              Envio para todo Brasil • Pagamento seguro
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
