"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string | null;
  category: string;
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
            "id, title, slug, excerpt, cover_image, published_at, category"
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
            className="border border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gray-800 animate-pulse"
          >
            <div className="h-48 w-full bg-gray-700"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mt-4"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-3 text-center py-12 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-medium mb-2">Nenhum post encontrado</h3>
        <p className="text-gray-400 mb-4">
          Novos artigos serão publicados em breve!
        </p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <article
          key={post.id}
          className="border border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-800"
        >
          {post.cover_image && post.cover_image.startsWith("http") && (
            <div className="relative h-48 w-full">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="mb-2">
              <span className="inline-block bg-[#ff0884] text-white text-xs px-2 py-1 rounded">
                {post.category || "Sem categoria"}
              </span>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h3 className="text-xl font-semibold mb-2 hover:text-[#ff0884]">
                {post.title}
              </h3>
            </Link>
            <p className="text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-[#ff0884] hover:underline text-sm font-medium"
            >
              Leia mais →
            </Link>
          </div>
        </article>
      ))}
    </>
  );
}
