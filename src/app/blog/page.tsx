import { PageIntro, ExploreLink } from "@/components/PageIntro";
import Link from "next/link";
import { Search, X, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { getBlogFilters, getBlogPosts } from "@/lib/blog-service";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { FeaturedPostCard, PostCard } from "@/components/blog/PostCard";

export const revalidate = 3600;

const PAGE_SIZE = 9;

type Filters = { category?: string; tag?: string; search?: string };

function blogHref(filters: Filters, page = 1) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.search) params.set("search", filters.search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

// Current page, its neighbours, the ends, and gaps in between.
function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ["gap" as const, n] : [n]));
}

const chip =
  "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors";
const chipIdle = `${chip} border-white/10 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground`;
const chipActive = `${chip} border-primary bg-primary/15 text-primary`;

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pick = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  const filters: Filters = {
    category: pick(params.category),
    tag: pick(params.tag),
    search: pick(params.search),
  };
  const page = Math.max(1, Number.parseInt(pick(params.page) || "1", 10) || 1);
  const filtered = Boolean(filters.category || filters.tag || filters.search);

  const [{ data: posts, count }, { categories, tags }] = await Promise.all([
    getBlogPosts({ ...filters, page, limit: PAGE_SIZE }),
    getBlogFilters(),
  ]);
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const showFeatured = !filtered && page === 1 && posts.length > 0;
  const [featured, ...rest] = showFeatured ? posts : [null, ...posts];

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />
      <Header />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-6 pb-24 pt-32 md:px-12">
        <PageIntro
          eyebrow="Blog"
          title={<>Continue no <span className="text-gradient-primary">jogo.</span></>}
          description="Histórias, curiosidades e guias sobre o universo dos games retro, dos arcades e da emulação."
        >
          <ExploreLink href="/tutorial">Guia de instalação</ExploreLink>
        </PageIntro>

        {/* BUSCA E FILTROS */}
        <section aria-label="Filtrar artigos" className="mb-10 space-y-5">
          <form action="/blog" method="get" role="search" className="relative max-w-xl">
            {filters.category && <input type="hidden" name="category" value={filters.category} />}
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="search"
              aria-label="Buscar artigos"
              placeholder="Buscar artigos, jogos, consoles..."
              defaultValue={filters.search || ""}
              className="h-12 w-full rounded-xl border border-white/10 bg-card/60 pl-11 pr-28 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-primary px-4 font-display text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-accent"
            >
              Buscar
            </button>
          </form>

          {categories.length > 1 && (
            <nav aria-label="Categorias" className="flex flex-wrap gap-2">
              <Link href={blogHref({ search: filters.search })} className={!filters.category ? chipActive : chipIdle}>
                Todos
              </Link>
              {categories.map((item) => (
                <Link
                  key={item.name}
                  href={blogHref({ category: item.name, search: filters.search })}
                  className={filters.category === item.name ? chipActive : chipIdle}
                >
                  {item.name}
                  <span className="font-mono text-[10px] text-muted-foreground">{item.count}</span>
                </Link>
              ))}
            </nav>
          )}

          {filtered && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{count}</strong> {count === 1 ? "artigo encontrado" : "artigos encontrados"}
                {filters.search && <> para “<span className="text-foreground">{filters.search}</span>”</>}
                {filters.tag && <> com a tag <span className="text-primary">#{filters.tag}</span></>}
              </span>
              <Link href="/blog" className="inline-flex items-center gap-1 text-primary hover:text-accent">
                <X className="size-3.5" />
                Limpar filtros
              </Link>
            </div>
          )}
        </section>

        {/* POSTS */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured && <FeaturedPostCard post={featured} />}
            {rest.map((post) => post && <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-12 text-center">
            <div className="glow-primary mx-auto mb-6 flex size-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Newspaper className="size-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold uppercase text-foreground">Nenhum artigo encontrado</h2>
            <p className="mt-2 text-muted-foreground">Tente outra busca ou veja todos os artigos.</p>
            <Link
              href="/blog"
              className="mt-6 inline-flex h-12 items-center rounded-xl border border-primary bg-primary px-6 font-display text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-accent"
            >
              Ver todos os artigos
            </Link>
          </div>
        )}

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <nav aria-label="Paginação" className="mt-14 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && (
              <Link href={blogHref(filters, page - 1)} className={chipIdle} aria-label="Página anterior">
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Link>
            )}
            {pageWindow(page, totalPages).map((item, index) =>
              item === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-muted-foreground">…</span>
              ) : (
                <Link
                  key={item}
                  href={blogHref(filters, item)}
                  aria-current={item === page ? "page" : undefined}
                  className={`flex size-10 items-center justify-center rounded-xl border font-mono text-sm transition-colors ${
                    item === page
                      ? "border-primary bg-primary text-white"
                      : "border-white/10 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {item}
                </Link>
              )
            )}
            {page < totalPages && (
              <Link href={blogHref(filters, page + 1)} className={chipIdle} aria-label="Próxima página">
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="size-4" />
              </Link>
            )}
          </nav>
        )}

        {/* TAGS */}
        {tags.length > 0 && (
          <section aria-labelledby="tags-title" className="mt-20 border-t border-border pt-10">
            <h2 id="tags-title" className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Assuntos populares
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((item) => (
                <Link
                  key={item.name}
                  href={blogHref({ tag: item.name })}
                  className={filters.tag === item.name ? chipActive : chipIdle}
                >
                  #{item.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
