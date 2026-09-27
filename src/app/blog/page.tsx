import { PageIntro, ExploreLink } from "@/components/PageIntro";
import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogFilters, getBlogPosts } from "@/lib/blog-service";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 3600;

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
  const page = Math.max(1, Number.parseInt(String(resolvedParams.page || "1"), 10) || 1);

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
  const { categories, tags } = use(getBlogFilters());

  // Calculate pagination
  const totalPages = Math.ceil(count / 9);

  return (
    <div className="flex flex-col site-page min-h-screen bg-background text-white">
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageIntro eyebrow="Blog" title={<>Continue no <span className="text-gradient-primary">jogo.</span></>} description="Novidades, histórias e guias para explorar o universo dos games e da emulação."><ExploreLink href="/tutorial">Guia de instalação</ExploreLink></PageIntro>

          {/* Filter Information */}
          {(category || tag || search) && (
            <div className="bg-card/40 rounded-2xl p-4 mb-8 flex flex-wrap gap-3 items-center justify-between border border-border">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-primary"
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
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-2xl text-sm mr-2">
                    Categoria: {category}
                  </span>
                )}
                {tag && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-2xl text-sm mr-2">
                    Tag: #{tag}
                  </span>
                )}
                {search && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-2xl text-sm">
                    Busca: {search}
                  </span>
                )}
              </div>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center"
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Blog posts grid */}
            <div className="lg:col-span-3">
              {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#ff0884]/5 transition-all duration-300 border border-border hover:border-primary/30 h-full flex flex-col"
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
                              <span className="text-muted-foreground">Sem imagem</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-primary/20 text-primary px-2 py-1 rounded-2xl text-xs font-bold">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </a>

                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <a href={`/blog/${post.slug}`} className="block">
                            <h2 className="text-xl font-bold mb-3 hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                              {post.title}
                            </h2>
                          </a>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
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
                <div className="bg-card/50 border border-border rounded-2xl p-12 text-center">
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
                  <p className="text-muted-foreground mb-6">
                    Não encontramos posts com os filtros selecionados.
                  </p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-2xl text-white bg-primary hover:bg-primary/90"
                  >
                    Ver todos os posts
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex flex-wrap justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${
                          category ? `&category=${encodeURIComponent(category)}` : ""
                        }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${
                          search ? `&search=${encodeURIComponent(search)}` : ""
                        }`}
                        className="px-4 py-2 bg-card text-white rounded-2xl hover:bg-panel transition-colors"
                      >
                        Anterior
                      </Link>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={`/blog?page=${pageNum}${
                            category ? `&category=${encodeURIComponent(category)}` : ""
                          }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${
                            search ? `&search=${encodeURIComponent(search)}` : ""
                          }`}
                          className={`px-4 py-2 rounded-2xl ${
                            pageNum === page
                              ? "bg-primary text-white"
                              : "bg-card text-white hover:bg-panel"
                          } transition-colors`}
                        >
                          {pageNum}
                        </Link>
                      )
                    )}

                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${
                          category ? `&category=${encodeURIComponent(category)}` : ""
                        }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${
                          search ? `&search=${encodeURIComponent(search)}` : ""
                        }`}
                        className="px-4 py-2 bg-card text-white rounded-2xl hover:bg-panel transition-colors"
                      >
                        Próximo
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Search Box */}
                <div className="p-0">
                  <form
                    className="flex border border-border rounded-2xl overflow-hidden bg-card"
                    action="/blog"
                    method="get"
                  >
                    <input
                      type="text"
                      name="search"
                      aria-label="Buscar artigos"
                      placeholder="Buscar no blog..."
                      defaultValue={search || ""}
                      className="px-4 py-2 bg-transparent w-full focus:outline-none text-white"
                    />
                    <button
                      type="submit"
                      aria-label="Buscar"
                      className="bg-primary px-4 flex items-center"
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
                <div className="p-6 bg-card rounded-2xl border border-border">
                  <h3 className="text-2xl font-medium mb-4">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories && categories.length > 0 ? (
                      categories.map((item) => (
                        <Link
                          key={item.name}
                          href={`/blog?category=${encodeURIComponent(item.name)}`}
                          className={`inline-block px-3 py-1 rounded-2xl text-sm transition-colors ${
                            category === item.name
                              ? "bg-primary text-white"
                              : "bg-panel hover:bg-primary/20 hover:text-primary"
                          }`}
                        >
                          {item.name}
                          <span className="ml-2 text-xs bg-gray-600 text-foreground/80 px-1.5 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        Nenhuma categoria encontrada
                      </p>
                    )}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="p-6 bg-card rounded-2xl border border-border">
                  <h3 className="text-2xl font-medium mb-4">Tags Populares</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((item) => (
                      <Link
                        key={item.name}
                        href={`/blog?tag=${encodeURIComponent(item.name)}`}
                        className={`inline-block px-3 py-1 rounded-2xl text-sm transition-colors ${
                          tag === item.name
                            ? "bg-primary text-white"
                            : "bg-panel hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        #{item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
