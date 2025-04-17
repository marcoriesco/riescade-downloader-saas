"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/blog-service";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Manually defined categories
const categories = [
  { id: "1", name: "Tutoriais", slug: "tutoriais", post_count: 5 },
  { id: "2", name: "Retrogaming", slug: "retrograming", post_count: 8 },
  { id: "3", name: "Emulação", slug: "emulacao", post_count: 12 },
  { id: "4", name: "Consoles", slug: "consoles", post_count: 6 },
  { id: "5", name: "Jogos", slug: "jogos", post_count: 9 },
  { id: "6", name: "Dicas", slug: "dicas", post_count: 7 },
];

export default function Blog({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get search parameters resolved
  const resolvedParams = use(searchParams);
  const category = resolvedParams.category as string;
  const tag = resolvedParams.tag as string;
  const search = resolvedParams.search as string;
  const page = parseInt((resolvedParams.page as string) || "1");

  // Fetch blog posts with filters
  const { data: posts, count } = use(
    getBlogPosts({
      category,
      tag,
      search,
      page,
      limit: 9,
    })
  );

  // Calculate pagination
  const totalPages = Math.ceil(count / 9);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow pt-20 ${robotoCondensed.className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
                Blog RIESCADE
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
                Novidades, guias e dicas sobre games retro e emulação
              </p>
            </div>
          </div>

          {/* Filter Information */}
          {(category || tag || search) && (
            <div className="bg-gray-800/40 rounded-lg p-4 mb-8 flex items-center justify-between border border-gray-700">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#ff0884]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="font-medium mr-2">Filtros:</span>
                {category && (
                  <span className="bg-[#ff0884]/20 text-[#ff0884] px-2 py-1 rounded text-sm mr-2">
                    Categoria: {category}
                  </span>
                )}
                {tag && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm mr-2">
                    Tag: #{tag}
                  </span>
                )}
                {search && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                    Busca: {search}
                  </span>
                )}
              </div>
              <Link
                href="/blog"
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Limpar filtros
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Blog posts grid */}
            <div className="md:col-span-3">
              {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <p className="text-gray-400 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
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
                              ? new Date(post.published_at).toLocaleDateString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
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
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
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
                  <h3 className="text-2xl font-bold mb-2">
                    Nenhum post encontrado
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Não encontramos posts com os filtros selecionados.
                  </p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#ff0884] hover:bg-[#ff0884]/90"
                  >
                    Ver todos os posts
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${
                          category ? `&category=${category}` : ""
                        }${tag ? `&tag=${tag}` : ""}${
                          search ? `&search=${search}` : ""
                        }`}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Anterior
                      </Link>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={`/blog?page=${pageNum}${
                            category ? `&category=${category}` : ""
                          }${tag ? `&tag=${tag}` : ""}${
                            search ? `&search=${search}` : ""
                          }`}
                          className={`px-4 py-2 rounded-md ${
                            pageNum === page
                              ? "bg-[#ff0884] text-white"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                          } transition-colors`}
                        >
                          {pageNum}
                        </Link>
                      )
                    )}

                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${
                          category ? `&category=${category}` : ""
                        }${tag ? `&tag=${tag}` : ""}${
                          search ? `&search=${search}` : ""
                        }`}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Próxima
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Search Box */}
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-2xl font-medium mb-4">Buscar</h3>
                  <form
                    className="flex border border-gray-700 rounded-lg overflow-hidden bg-gray-700"
                    action="/blog"
                    method="get"
                  >
                    <input
                      type="text"
                      name="search"
                      placeholder="Buscar no blog..."
                      defaultValue={search || ""}
                      className="px-4 py-2 bg-transparent w-full focus:outline-none text-white"
                    />
                    <button
                      type="submit"
                      className="bg-[#ff0884] px-4 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </form>
                </div>

                {/* Categories */}
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-2xl font-medium mb-4">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/blog?category=${category.slug}`}
                          className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                        >
                          {category.name}
                          <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded-full">
                            {category.post_count}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-400">
                        Nenhuma categoria encontrada
                      </p>
                    )}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-2xl font-medium mb-4">Tags Populares</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/blog?tag=emulacao"
                      className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                    >
                      #emulacao
                    </Link>
                    <Link
                      href="/blog?tag=retroarch"
                      className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                    >
                      #retroarch
                    </Link>
                    <Link
                      href="/blog?tag=nintendo"
                      className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                    >
                      #nintendo
                    </Link>
                    <Link
                      href="/blog?tag=arcade"
                      className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                    >
                      #arcade
                    </Link>
                    <Link
                      href="/blog?tag=playstation"
                      className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                    >
                      #playstation
                    </Link>
                    <Link
                      href="/blog?tag=retrogames"
                      className="inline-block px-3 py-1 bg-gray-700 hover:bg-[#ff0884]/20 hover:text-[#ff0884] rounded-md text-sm transition-colors"
                    >
                      #retrogames
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
