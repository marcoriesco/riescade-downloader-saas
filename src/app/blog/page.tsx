import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts, getBlogCategories } from "@/lib/blog-service";
import { BlogPost } from "@/types/blog";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const revalidate = 3600; // Revalidate every hour

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

  // Fetch categories for sidebar
  const categories = use(getBlogCategories());

  // Calculate pagination
  const totalPages = Math.ceil(count / 9);

  // Log para debug
  console.log("Categorias:", categories);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blog Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500">
                RIESCADE BLOG
              </span>
            </h1>
            <p
              className={`${robotoCondensed.className} text-xl text-gray-300 max-w-3xl mx-auto`}
            >
              Mergulhe no universo dos jogos de arcade clássicos, curiosidades,
              histórias e muito mais.
            </p>
          </div>

          {/* Search and Categories Section - Top */}
          <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-medium mb-4">Busca</h3>
              <form action="/blog" method="GET" className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Procure no blog"
                  className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff0884] text-white"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#ff0884]"
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
                      strokeWidth={2}
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
                  <p className="text-gray-400">Nenhuma categoria encontrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Filter information */}
          {(category || tag || search) && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-medium mb-2">Filtrando por:</h2>
              {category && (
                <span className="inline-block bg-[#ff0884]/20 text-[#ff0884] px-3 py-1 rounded-full text-sm mr-2">
                  Categoria: {category}
                </span>
              )}
              {tag && (
                <span className="inline-block bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-sm mr-2">
                  Tag: {tag}
                </span>
              )}
              {search && (
                <span className="inline-block bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm mr-2">
                  Busca: &quot;{search}&quot;
                </span>
              )}
              <Link
                href="/blog"
                className="text-[#ff0884] text-sm ml-2 hover:underline"
              >
                Limpar filtros
              </Link>
            </div>
          )}

          {/* Blog posts section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 pb-2">
              Explore a História dos Games e Reviva a Era de Ouro
            </h2>
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl="/blog"
                  searchParams={resolvedParams}
                />
              </>
            ) : (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-medium mb-2">
                  Nenhum post encontrado
                </h3>
                <p className="text-gray-400 mb-4">
                  Tente ajustar seus critérios de busca ou filtros
                </p>
                <Link
                  href="/blog"
                  className="inline-block bg-[#ff0884] text-white px-4 py-2 rounded-md hover:bg-[#ff0884]/90"
                >
                  Ver todos os posts
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/logos.webp"
                  alt="RIESCADE Logo"
                  width={35}
                  height={35}
                />
                <h3 className="text-xl font-bold">RIESCADE</h3>
              </div>
              <p className={`${robotoCondensed.className} text-gray-400 mt-2`}>
                RetroGames e Games, sempre emulando...
              </p>
            </div>

            {/* Redes Sociais */}
            <div className="mt-8 flex flex-col space-y-4">
              <div className={`${robotoCondensed.className} flex space-x-6`}>
                <Link
                  href="https://t.me/riescade"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 496 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M248 8C111.033 8 0 119.033 0 256s111.033 248 248 248 248-111.033 248-248S384.967 8 248 8zm114.952 168.66c-3.732 39.215-19.881 134.378-28.1 178.3-3.476 18.584-10.322 24.816-16.948 25.425-14.4 1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25 5.342-39.5 3.652-3.793 67.107-61.51 68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608 69.142-14.845 10.194-26.894 9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7 18.45-13.7 108.446-47.248 144.628-62.3c68.872-28.647 83.183-33.623 92.511-33.789 2.052-.034 6.639.474 9.61 2.885a10.452 10.452 0 0 1 3.53 6.716 43.765 43.765 0 0 1 .417 9.769z" />
                  </svg>
                  <span className="hidden md:flex">Telegram</span>
                </Link>
                <Link
                  href="https://chat.whatsapp.com/Kn2eA8g8FIp0aTYV0iNYSe"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                  <span className="hidden md:flex">WhatsApp</span>
                </Link>
                <Link
                  href="https://facebook.com/riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                  <span className="hidden md:flex">Facebook</span>
                </Link>

                <Link
                  href="https://instagram.com/riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                  <span className="hidden md:flex">Instagram</span>
                </Link>

                <Link
                  href="https://youtube.com/@riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
                  </svg>
                  <span className="hidden md:flex">YouTube</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Blog Post Card Component
function BlogPostCard({ post }: { post: BlogPost }) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("pt-BR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Sem data";

  return (
    <article className="border border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-800">
      {post.cover_image && (
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
        <div className="mb-6">
          <span className="inline-block bg-[#ff0884] text-white text-xs px-2 py-1 rounded">
            {post.category || "Sem categoria"}
          </span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-[#ff0884]">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-300 mb-6 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 flex items-center">
            <svg
              className="mr-1 h-4 w-4 text-gray-500"
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
            {formattedDate}
          </span>
          <Link
            href={`/blog/${post.slug}`}
            className="text-[#ff0884] hover:underline text-sm font-medium"
          >
            Leia mais →
          </Link>
        </div>
      </div>
    </article>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Create URL with preserved search params
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();

    // Add current search params (excluding 'page')
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value !== undefined) {
        params.append(key, Array.isArray(value) ? value[0] : value);
      }
    });

    // Add page param
    params.append("page", page.toString());

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center space-x-1">
        {/* Previous page */}
        {currentPage > 1 && (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Anterior
          </Link>
        )}

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show current page, first, last, and pages directly adjacent to current
          const shouldShowPage =
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1;

          // Show ellipsis for gaps in page numbers
          const showEllipsisBefore = page === 1 && currentPage > 3;
          const showEllipsisAfter =
            page === totalPages && currentPage < totalPages - 2;

          return shouldShowPage ? (
            <React.Fragment key={page}>
              {showEllipsisBefore && (
                <span className="px-3 py-1 text-gray-500">...</span>
              )}

              <Link
                href={createPageUrl(page)}
                className={`px-3 py-1 rounded-md ${
                  page === currentPage
                    ? "bg-[#ff0884] text-white"
                    : "border border-gray-700 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {page}
              </Link>

              {showEllipsisAfter && (
                <span className="px-3 py-1 text-gray-500">...</span>
              )}
            </React.Fragment>
          ) : null;
        })}

        {/* Next page */}
        {currentPage < totalPages && (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-3 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-700"
          >
            Próximo
          </Link>
        )}
      </nav>
    </div>
  );
}
