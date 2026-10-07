import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3 } from "lucide-react";
import type { BlogPost } from "@/types/blog";

type CardPost = Pick<
  BlogPost,
  "slug" | "title" | "excerpt" | "cover_image" | "published_at" | "category" | "reading_time"
>;

export function formatPostDate(value: string | null, month: "short" | "long" = "short") {
  return value
    ? new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month, year: "numeric" })
    : null;
}

function Cover({ post, sizes, className = "" }: { post: CardPost; sizes: string; className?: string }) {
  return post.cover_image ? (
    <Image
      src={post.cover_image}
      alt=""
      fill
      sizes={sizes}
      className={`object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 ${className}`}
    />
  ) : (
    <div className="grid-overlay absolute inset-0 bg-surface" />
  );
}

function Meta({ post }: { post: CardPost }) {
  const date = formatPostDate(post.published_at);
  return (
    <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {date && (
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-primary" />
          {date}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Clock3 className="size-3.5 text-primary" />
        {post.reading_time || 5} min
      </span>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex rounded-lg border border-primary/30 bg-background/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur-sm">
      {category}
    </span>
  );
}

export function PostCard({ post }: { post: CardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.08)]"
    >
      <div className="relative aspect-[1200/630] overflow-hidden">
        <Cover post={post} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
        <div className="absolute left-3 top-3">
          <CategoryBadge category={post.category} />
        </div>
      </div>
      <div className="flex flex-grow flex-col p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-foreground transition-colors line-clamp-2 group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-3 flex-grow text-sm leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>
        <div className="mt-5 border-t border-border pt-4">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}

export function FeaturedPostCard({ post }: { post: CardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl border-2 border-primary/40 transition-all duration-300 hover:border-primary/70 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.15)] md:col-span-2 lg:row-span-2"
    >
      <Cover post={post} sizes="(max-width: 1024px) 100vw, 66vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay" />
      <div className="relative p-7 md:p-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-lg border border-primary bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Mais recente
          </span>
          <CategoryBadge category={post.category} />
        </div>
        <h2 className="max-w-2xl font-display text-2xl font-bold leading-tight text-white transition-colors group-hover:text-primary md:text-4xl">
          {post.title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 line-clamp-3 md:text-base">{post.excerpt}</p>
        <div className="mt-6">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}
