"use client";

import { useEffect, useState } from "react";
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
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 animate-pulse h-full"
          >
            <div className="h-48 w-full bg-gray-700"></div>
            <div className="p-6">
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
      <div className="col-span-3 bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto mb-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-2xl font-bold mb-2">Nenhum post encontrado</h3>
        <p className="text-gray-400 mb-6">
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
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#ff0884]/5 transition-all duration-300 border border-gray-700 hover:border-[#ff0884]/30 h-full flex flex-col"
        >
          <a href={`/blog/${post.slug}`} className="block">
            <div className="relative h-48 w-full">
              {post.cover_image ? (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#ff0884]/20 text-[#ff0884] px-2 py-1 rounded text-xs font-bold">
                  {post.category}
                </span>
              </div>
            </div>
          </a>

          <div className="p-6 flex-grow flex flex-col">
            <div className="flex-grow">
              <a href={`/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-bold mb-3 hover:text-[#ff0884] transition-colors line-clamp-2 cursor-pointer">
                  {post.title}
                </h2>
              </a>
              <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Não publicado"}
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {post.reading_time || 5} min
              </div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
