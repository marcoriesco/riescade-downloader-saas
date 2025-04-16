import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getBlogPostBySlug,
  updatePostViews,
  getRelatedPosts,
} from "@/lib/blog-service";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Tipos para os dados do blog
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published_at: string | null;
  category: string;
  reading_time: number;
  author: string;
  author_image: string;
  tags: string[];
  views: number;
}

type Props = {
  params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post não encontrado",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : [],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Update view count
  await updatePostViews(post.id);

  // Get related posts
  const relatedPosts = await getRelatedPosts(post, 3);

  // Create category slug from category name
  const categorySlug = post.category.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow pt-20 ${robotoCondensed.className}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Post Header */}
          <header className="mb-16">
            {/* Category */}
            <div className="mb-6">
              <Link
                href={`/blog?category=${categorySlug}`}
                className="inline-block bg-[#ff0884]/20 text-[#ff0884] px-3 py-1 rounded-full text-sm hover:bg-[#ff0884]/30 transition-colors font-medium"
              >
                {post.category}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-10 leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center text-gray-400 text-sm mb-10 space-x-6">
              <time
                dateTime={post.published_at || ""}
                className="flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
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
                {formatDate(post.published_at)}
              </time>

              {post.author && (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">{post.author}</span>
                </span>
              )}

              {post.reading_time && (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
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
                  {post.reading_time} min de leitura
                </span>
              )}

              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.views || 0} visualizações
              </span>
            </div>

            {/* Cover Image */}
            {post.cover_image && post.cover_image.startsWith("http") && (
              <div className="relative h-80 md:h-[500px] rounded-xl overflow-hidden mb-16 shadow-2xl">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
              </div>
            )}
          </header>

          {/* Post Content */}
          <article className="content-wrapper">
            <div
              className="blog-content text-gray-300 text-lg leading-relaxed
              [&>p]:mb-8 
              [&>h1]:text-4xl [&>h1]:font-extrabold [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:text-white [&>h1]:bg-gradient-to-r [&>h1]:from-white [&>h1]:to-gray-400 [&>h1]:bg-clip-text [&>h1]:text-transparent [&>h1]:leading-tight
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-6 [&>h2]:text-white [&>h2]:pb-2 [&>h2]:border-b [&>h2]:border-[#ff0884]/30 [&>h2]:leading-snug
              [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-4 [&>h3]:text-white
              [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-6 [&>h4]:mb-4 [&>h4]:text-[#ff0884]
              [&>ul]:mb-8 [&>ul]:pl-8 [&>ul]:list-disc
              [&>ol]:mb-8 [&>ol]:pl-8 [&>ol]:list-decimal
              [&>li]:mb-3
              [&>a]:text-[#ff0884] [&>a]:border-b [&>a]:border-[#ff0884]/30 hover:[&>a]:border-[#ff0884]
              [&>blockquote]:border-l-4 [&>blockquote]:border-[#ff0884] [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:my-8 [&>blockquote]:italic [&>blockquote]:text-gray-400
              [&>img]:rounded-lg [&>img]:shadow-lg [&>img]:my-8
              [&>hr]:my-12 [&>hr]:border-gray-700
              [&>pre]:bg-gray-800 [&>pre]:rounded-lg [&>pre]:p-6 [&>pre]:my-8 [&>pre]:overflow-auto [&>pre]:border [&>pre]:border-gray-700
              [&>code]:bg-gray-800/50 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
              [&>table]:w-full [&>table]:my-8 [&>table]:border-collapse
              [&>table>thead>tr>th]:bg-gray-800 [&>table>thead>tr>th]:text-white [&>table>thead>tr>th]:p-3 [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-gray-700
              [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-gray-700 [&>table>tbody>tr>td]:p-3"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Tags
              </h2>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gray-700 transition-colors hover:text-white"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-700">
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-[#ff0884]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
                Posts Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    className="border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-gray-800/50 hover:border-[#ff0884]/40 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {relatedPost.cover_image &&
                      relatedPost.cover_image.startsWith("http") && (
                        <div className="relative h-40 w-full">
                          <Image
                            src={relatedPost.cover_image}
                            alt={relatedPost.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                        </div>
                      )}
                    <div className="p-5">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <h3 className="text-lg font-bold mb-3 group-hover:text-[#ff0884] transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mb-4 flex items-center">
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
                        {formatDate(relatedPost.published_at)}
                      </p>
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="text-[#ff0884] text-sm font-medium inline-flex items-center group-hover:underline"
                      >
                        Leia mais
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <div className="mt-16 pt-8 border-t border-gray-700">
            <h3 className="text-xl font-bold mb-6 flex items-center">
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Compartilhe este artigo
            </h3>
            <div className="flex space-x-5">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] text-white p-3 rounded-lg hover:bg-[#1a8cd8] transition-colors shadow-md flex items-center space-x-2"
                aria-label="Compartilhar no Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                <span>Twitter</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#4267B2] text-white p-3 rounded-lg hover:bg-[#385898] transition-colors shadow-md flex items-center space-x-2"
                aria-label="Compartilhar no Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0077B5] text-white p-3 rounded-lg hover:bg-[#006699] transition-colors shadow-md flex items-center space-x-2"
                aria-label="Compartilhar no LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Comment Section - Can be implemented with a third-party service */}
          <div className="mt-16 pt-10 border-t border-gray-700">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-[#ff0884]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Comentários
            </h2>
            <div className="bg-gray-800/50 p-10 rounded-xl text-center shadow-xl border border-gray-700 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-400 mb-6 text-lg">
                Os comentários são fornecidos por um serviço de terceiros.
              </p>
              <button className="bg-[#ff0884] text-white px-6 py-3 rounded-lg hover:bg-[#ff0884]/90 transition-colors shadow-md font-medium flex items-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Carregar Comentários
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
