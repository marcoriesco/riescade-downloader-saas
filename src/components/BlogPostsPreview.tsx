"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string | null;
  category: string;
  reading_time?: number;
}

export default function BlogPostsPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(
            "id, title, slug, excerpt, cover_image, published_at, category, reading_time"
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Erro ao carregar posts recentes:", error);
          return;
        }

        setPosts(data || []);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-border bg-background animate-pulse overflow-hidden"
          >
            <div className="aspect-video w-full bg-surface/50"></div>
            <div className="p-5">
              <div className="h-6 bg-surface rounded mb-4"></div>
              <div className="h-4 bg-surface rounded mb-2"></div>
              <div className="h-4 bg-surface rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-surface rounded w-1/2 mt-4"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-3 border border-border bg-background/50 p-12 text-center text-muted-foreground font-mono text-sm uppercase tracking-widest">
        Nenhum post encontrado
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group border border-border bg-background hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col"
        >
          <div className="aspect-video overflow-hidden relative">
            {post.cover_image ? (
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Sem imagem</span>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-background/80 border border-primary/30 font-mono text-[10px] text-primary uppercase">
              {post.category || "General"}
            </div>
          </div>
          <div className="p-5 flex-grow flex flex-col">
            <h3 className="font-display font-bold text-lg uppercase text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-grow">{post.excerpt}</p>
            <div className="mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Não publicado"}{" "}
              • {post.reading_time || 5} min
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
