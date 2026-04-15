const screenshots = [
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Floading.webp&w=1080&q=75", title: "Loading", subtitle: "RIESCADE" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fallgames.webp&w=1080&q=75", title: "Jogos", subtitle: "RIESCADE" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Femulators.webp&w=1080&q=75", title: "Emuladores", subtitle: "RIESCADE" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Farcade.webp&w=1080&q=75", title: "Arcade", subtitle: "RIESCADE" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fsf3.webp&w=1080&q=75", title: "Street Fighter III", subtitle: "Arcade" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fswitch.webp&w=1080&q=75", title: "Nintendo Switch", subtitle: "Consoles" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fmariowonder.webp&w=1080&q=75", title: "Super Mario Bros. Wonder", subtitle: "Nintendo Switch" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fwindows.webp&w=1080&q=75", title: "Windows", subtitle: "PC Gamer" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fn64dd.webp&w=1080&q=75", title: "Nintendo 64 Disk", subtitle: "Extensões" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fpsvita.webp&w=1080&q=75", title: "PS Vita", subtitle: "Portáteis" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fpinballm.webp&w=1080&q=75", title: "Pinball M", subtitle: "Pinballs" },
  { src: "https://www.riescade.com.br/_next/image?url=%2Fscreenshots%2Fdoom3.webp&w=1080&q=75", title: "DOOM 3", subtitle: "Ports" },
];

const ScreenshotsSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
            // MULTISISTEMA
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
            <div
              key={shot.title}
              className="group relative bg-panel border border-border overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={shot.src}
                  alt={shot.title}
                  loading="lazy"
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
  );
};

export default ScreenshotsSection;
