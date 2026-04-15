const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-primary flex items-center justify-center">
              <div className="size-2 bg-background" />
            </div>
            <span className="font-display font-bold text-sm uppercase tracking-widest text-foreground">
              Riescade Games
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.riescade.com.br/tutorial" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Tutorial</a>
            <a href="https://www.riescade.com.br/plataformas" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Plataformas</a>
            <a href="https://www.riescade.com.br/blog" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Blog</a>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            © 2025 Riescade Games
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
