import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary flex items-center justify-center">
            <div className="size-3 bg-background" />
          </div>
          <span className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
            Riescade
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="https://www.riescade.com.br/tutorial" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Tutorial
          </a>
          <a href="https://www.riescade.com.br/plataformas" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Plataformas
          </a>
          <a href="https://www.riescade.com.br/blog" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Blog
          </a>
          <a
            href="https://www.riescade.com.br"
            className="h-9 px-5 flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all"
          >
            Login
          </a>
        </nav>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-6 flex flex-col gap-4">
          <a href="https://www.riescade.com.br/tutorial" className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Tutorial</a>
          <a href="https://www.riescade.com.br/plataformas" className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Plataformas</a>
          <a href="https://www.riescade.com.br/blog" className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Blog</a>
          <a href="https://www.riescade.com.br" className="h-10 flex items-center justify-center bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider">Login</a>
        </div>
      )}
    </header>
  );
};

export default Header;
