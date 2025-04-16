import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Header } from "@/components/Header";

interface PageProps {
  params: {
    slug: string;
  };
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const categoryName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${categoryName} - RIESCADE Arcade Blog`,
    description: `Veja todos os artigos sobre ${categoryName} no RIESCADE Arcade Blog, seu destino para conteúdo retrô de arcade.`,
  };
}

// Formatar data para exibição
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
}

export default async function CategoryPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Transformar o slug de volta para o nome da categoria
  const categoryName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Buscar posts da categoria
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("category", categoryName)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar posts:", error);
  }

  // Buscar todas as categorias para o sidebar
  const { data: categories } = await supabase
    .from("blog_categories")
    .select("name, slug, post_count")
    .order("post_count", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Header */}
          <div className="mb-12 border-b border-gray-800 pb-8">
            <div className="flex items-center mb-6">
              <span className="inline-block bg-[#ff0884] w-2 h-12 mr-4"></span>
              <h1 className="text-4xl md:text-5xl font-extrabold">
                {categoryName}
              </h1>
            </div>
            <p className="text-gray-400 text-xl max-w-3xl">
              {posts?.length || 0} artigos sobre {categoryName} para os
              verdadeiros fãs de games retrô de arcade.
            </p>
          </div>

          {/* Main Content and Sidebar */}
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
                          <div className="flex items-center mb-3">
                            <span className="text-sm text-gray-400">
                              {formatDate(post.published_at)}
                            </span>
                            <span className="mx-2 text-gray-600">•</span>
                            <span className="text-sm text-gray-400">
                              {post.reading_time} min de leitura
                            </span>
                          </div>
                          <h2 className="text-xl font-bold mb-3 line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-gray-400 line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                              <Image
                                src={
                                  post.author_image ||
                                  "/images/avatar-default.jpg"
                                }
                                alt={post.author}
                                width={32}
                                height={32}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {post.author}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Nenhum post encontrado
                  </h3>
                  <p className="text-gray-400 mb-8">
                    Ainda não há posts nesta categoria. Novos conteúdos em
                    breve!
                  </p>
                  <Link
                    href="/blog"
                    className="bg-[#ff0884] hover:bg-[#ff0884]/90 text-white py-2 px-6 rounded-full inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                    Voltar para o Blog
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Categories */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <span className="inline-block w-6 h-1 bg-[#ff0884] mr-2"></span>
                    Categorias
                  </h3>
                  <div className="space-y-4">
                    {categories &&
                      categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/blog/category/${category.slug}`}
                          className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                            category.name === categoryName
                              ? "bg-[#ff0884]/20 text-[#ff0884] font-medium"
                              : "hover:bg-gray-700"
                          }`}
                        >
                          <span>{category.name}</span>
                          <span className="bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-1">
                            {category.post_count}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Return to all posts */}
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-[#ff0884] hover:text-white transition-colors font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  Voltar para todos os posts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
