import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/blog-service";
import { Roboto_Condensed } from "next/font/google";
import { Header } from "@/components/Header";
import { Metadata } from "next";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const revalidate = 3600;

// Manually defined categories
const categories = [
  {
    id: "1",
    name: "Tutoriais",
    slug: "tutoriais",
    post_count: 5,
    description: "Guias e tutoriais sobre emulação",
  },
  {
    id: "2",
    name: "Retrogaming",
    slug: "retrograming",
    post_count: 8,
    description: "Tudo sobre o mundo dos jogos retro",
  },
  {
    id: "3",
    name: "Emulação",
    slug: "emulacao",
    post_count: 12,
    description: "Novidades e dicas sobre emuladores",
  },
  {
    id: "4",
    name: "Consoles",
    slug: "consoles",
    post_count: 6,
    description: "Informações sobre consoles clássicos",
  },
  {
    id: "5",
    name: "Jogos",
    slug: "jogos",
    post_count: 9,
    description: "Análises e resenhas de jogos",
  },
  {
    id: "6",
    name: "Dicas",
    slug: "dicas",
    post_count: 7,
    description: "Dicas e truques para otimizar sua experiência",
  },
];

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${categoryName} - RIESCADE Arcade Blog`,
    description: `Veja todos os artigos sobre ${categoryName} no RIESCADE Arcade Blog, seu destino para conteúdo retrô de arcade.`,
  };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Transformar o slug de volta para o nome da categoria
  const { slug } = use(params);

  // Encontrar a categoria pelo slug nas categorias manualmente definidas
  const category = categories.find((cat) => cat.slug === slug);

  // Se a categoria não existir, definir valores padrão
  const categoryName = category?.name || "Categoria";
  const categoryDescription =
    category?.description || "Explorar posts da categoria";

  // Buscar posts da categoria
  const { data: posts } = use(
    getBlogPosts({
      category: categoryName,
      limit: 12,
    })
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow pt-20 ${robotoCondensed.className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Header */}
          <div className="mb-12">
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-400 hover:text-[#ff0884] mb-6 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Voltar para o Blog
            </Link>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="text-white">Categoria: </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500">
                {categoryName}
              </span>
            </h1>
            <p className="text-xl text-gray-400">{categoryDescription}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Posts Grid */}
            <div className="lg:col-span-3">
              {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-colors"
                    >
                      <Link href={`/blog/${post.slug}`} className="block">
                        <div className="relative h-64 w-full">
                          <Image
                            src={
                              post.cover_image ||
                              "/images/blog/default-cover.jpg"
                            }
                            alt={post.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="p-6">
                          <h2 className="text-xl font-bold mb-3 line-clamp-2 text-white hover:text-[#ff0884] transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-gray-400 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
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
                                ? new Date(
                                    post.published_at
                                  ).toLocaleDateString("pt-BR", {
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
                      </Link>
                    </div>
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
                    Não encontramos posts para esta categoria.
                  </p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#ff0884] hover:bg-[#ff0884]/90"
                  >
                    Ver todos os posts
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Categories */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <span className="inline-block w-6 h-1 bg-[#ff0884] mr-2"></span>
                    Categorias
                  </h3>
                  <div className="space-y-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/blog/category/${cat.slug}`}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                          cat.name === categoryName
                            ? "bg-[#ff0884]/20 text-[#ff0884] font-medium"
                            : "hover:bg-gray-700"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-1">
                          {cat.post_count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Return to all posts */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="inline-block w-6 h-1 bg-[#ff0884] mr-2"></span>
                    Tags Populares
                  </h3>
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
