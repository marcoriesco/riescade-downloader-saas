import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getBlogPosts,
  getBlogCategories,
  getFeaturedPosts,
} from "@/lib/blog-service";
import { BlogPost } from "@/types/blog";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const revalidate = 3600; // Revalidate every hour

export default async function Blog({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get search parameters
  const category = searchParams.category as string;
  const tag = searchParams.tag as string;
  const search = searchParams.search as string;
  const page = parseInt((searchParams.page as string) || "1");

  // Fetch blog posts with filters
  const { data: posts, count } = await getBlogPosts({
    category,
    tag,
    search,
    page,
    limit: 9,
  });

  // Fetch featured posts for hero section
  const featuredPosts = await getFeaturedPosts(3);

  // Fetch categories for sidebar
  const categories = await getBlogCategories();

  // Calculate pagination
  const totalPages = Math.ceil(count / 9);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blog Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500">
                RIESCADE ARCADE BLOG
              </span>
            </h1>
            <p
              className={`${robotoCondensed.className} text-xl text-gray-300 max-w-3xl mx-auto`}
            >
              Mergulhe no universo dos jogos de arcade clássicos, curiosidades,
              histórias e muito mais.
            </p>
          </div>

          {/* Hero Section */}
          <section className="mb-16">
            <h1 className="text-4xl font-bold mb-8">Blog</h1>

            {featuredPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <FeaturedPostCard
                    key={post.id}
                    post={post}
                    isMain={index === 0}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="md:w-2/3">
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

              {/* Blog posts grid */}
              {posts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {posts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/blog"
                    searchParams={searchParams}
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
            </div>

            {/* Sidebar */}
            <div className="md:w-1/3">
              {/* Search */}
              <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium mb-4">Buscar</h3>
                <form action="/blog" method="GET">
                  <div className="flex">
                    <input
                      type="text"
                      name="search"
                      defaultValue={search}
                      placeholder="Buscar posts..."
                      className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff0884] text-white"
                    />
                    <button
                      type="submit"
                      className="bg-[#ff0884] text-white px-4 py-2 rounded-r-md hover:bg-[#ff0884]/90"
                    >
                      Buscar
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium mb-4">Categorias</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/blog?category=${category.slug}`}
                        className="flex justify-between items-center hover:text-[#ff0884]"
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                          {category.post_count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
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
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-[#ff0884]">
            {post.title}
          </h2>
        </Link>
        <div className="flex items-center text-sm text-gray-400">
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
        </div>
        <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="text-[#ff0884] hover:underline text-sm font-medium"
        >
          Leia mais →
        </Link>
      </div>
    </article>
  );
}

// Featured Post Card Component
function FeaturedPostCard({
  post,
  isMain = false,
}: {
  post: BlogPost;
  isMain?: boolean;
}) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("pt-BR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Sem data";

  return (
    <article
      className={`relative rounded-lg overflow-hidden ${
        isMain ? "md:col-span-2" : ""
      }`}
    >
      <div className="relative h-64 w-full">
        <Image
          src={
            post.cover_image && post.cover_image.startsWith("http")
              ? post.cover_image
              : "/images/default-blog-cover.jpg"
          }
          alt={post.title}
          fill
          priority={isMain}
          sizes={
            isMain
              ? "(max-width: 768px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Link
          href={`/blog/category/${post.category || ""}`}
          className="inline-block bg-[#ff0884] text-white text-xs px-2 py-1 rounded mb-2"
        >
          {post.category || "Sem categoria"}
        </Link>
        <Link href={`/blog/${post.slug}`}>
          <h3
            className={`text-white font-bold mb-2 ${
              isMain ? "text-2xl" : "text-xl"
            }`}
          >
            {post.title}
          </h3>
        </Link>
        <div className="flex items-center text-sm text-gray-300">
          <svg
            className="mr-1 h-4 w-4 text-gray-400"
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
