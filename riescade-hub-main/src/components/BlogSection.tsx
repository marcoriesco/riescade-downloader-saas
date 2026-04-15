const posts = [
  {
    image: "https://www.riescade.com.br/_next/image?url=%2Fimages%2Fblog%2Fpaprium-a-odisseia-controvertida-do-jogo-homebrew-do-mega-drive.webp&w=3840&q=75",
    category: "General",
    title: "Paprium: A Odisseia Controvertida do Jogo Homebrew do Mega Drive",
    excerpt: "Descubra a complexa história de Paprium, o ambicioso beat 'em up homebrew para Mega Drive.",
    date: "16 de jul. de 2025",
    url: "https://www.riescade.com.br/blog/paprium-a-odisseia-controvertida-do-jogo-homebrew-do-mega-drive",
  },
  {
    image: "https://www.riescade.com.br/_next/image?url=%2Fimages%2Fblog%2Fa-historia-completa-do-microsoft-xbox-do-original-ao-series-xs.jpg&w=3840&q=75",
    category: "General",
    title: "A História Completa do Microsoft Xbox: Do Original ao Series X|S",
    excerpt: "Explore a fascinante jornada do Microsoft Xbox, desde seu lançamento em 2001.",
    date: "16 de jul. de 2025",
    url: "https://www.riescade.com.br/blog/a-historia-completa-do-microsoft-xbox-do-original-ao-series-xs",
  },
  {
    image: "https://www.riescade.com.br/_next/image?url=%2Fimages%2Fblog%2Fos_jogos_perdidos.webp&w=3840&q=75",
    category: "Curiosidades",
    title: "Os Jogos Perdidos: Clássicos que Nunca Foram Lançados",
    excerpt: "No vasto universo dos videogames, nem todos os títulos veem a luz do dia.",
    date: "25 de jun. de 2025",
    url: "https://www.riescade.com.br/blog/os-jogos-perdidos-classicos-que-nunca-foram-lancados-ou-foram-esquecidos",
  },
];

const BlogSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--surface))_0%,transparent_50%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
            // BLOG
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
            Blog <span className="text-gradient-primary">Riescade</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Novidades e artigos sobre o universo dos jogos retro
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.title}
              href={post.url}
              className="group border border-border bg-background hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-background/80 border border-primary/30 font-mono text-[10px] text-primary uppercase">
                  {post.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg uppercase text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  {post.date} • 5 min
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.riescade.com.br/blog"
            className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:text-accent transition-colors uppercase tracking-widest"
          >
            Ver todos os artigos →
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
