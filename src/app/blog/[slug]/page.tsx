"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from "html-react-parser";
import {
  getBlogPostBySlug,
  updatePostViews,
  getRelatedPosts,
} from "@/lib/blog-service";
import { formatDate } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Roboto, Roboto_Condensed } from "next/font/google";
import styles from "@/styles/markdown.module.css";
import Footer from "@/components/Footer";

// We use the layout.tsx file for metadata generation
// This allows us to keep this as a client component

// Define platform keywords and their corresponding URLs
const PLATFORM_KEYWORDS = {
  gameboy: "/platforms/gb",
  nintendo: "/platforms/nintendo",
  playstation: "/platforms/psx",
  sega: "/platforms/sega",
  xbox: "/platforms/xbox",
  atari: "/platforms/atari",
  dreamcast: "/platforms/dreamcast",
  nes: "/platforms/nes",
  snes: "/platforms/snes",
  n64: "/platforms/n64",
  genesis: "/platforms/genesis",
  "master system": "/platforms/mastersystem",
  "mega drive": "/platforms/megadrive",
  "game boy color": "/platforms/gbc",
  "game boy advance": "/platforms/gba",
  "nintendo 64": "/platforms/n64",
  "super nintendo": "/platforms/snes",
  "playstation 2": "/platforms/ps2",
  ps2: "/platforms/ps2",
  ps1: "/platforms/psx",
  psx: "/platforms/psx",
  gba: "/platforms/gba",
  gbc: "/platforms/gbc",
  gb: "/platforms/gb",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

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
  cover_image: string | null;
  published_at: string | null;
  category: string;
  reading_time: number;
  author: string;
  author_image: string | null;
  tags: string[];
  views: number;
}

export default function BlogPost() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    // Função para carregar os dados do post
    async function loadPostData() {
      if (!slug) return;

      try {
        setIsLoading(true);
        const postData = await getBlogPostBySlug(slug);

        if (!postData) {
          setNotFound404(true);
          return;
        }

        setPost(postData);

        // Update view count
        updatePostViews(postData.id);

        // Get related posts
        const related = await getRelatedPosts(postData, 3);
        setRelatedPosts(related);
      } catch (error) {
        console.error("Erro ao carregar dados do post:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPostData();
  }, [slug]);

  // Redirecionar para 404 se o post não for encontrado
  if (notFound404) {
    notFound();
    return null;
  }

  // Mostrar um loader enquanto carrega
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff0884]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  // Se não temos post após carregar, mostra uma mensagem de erro
  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Erro ao carregar o post</h1>
            <p className="text-gray-400">
              Não foi possível carregar o conteúdo solicitado.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Function to check and add platform links to text content
  const addPlatformLinks = (textContent: string) => {
    // Create regex pattern for all keywords (case insensitive)
    const keywordPattern = new RegExp(
      "\\b(" + Object.keys(PLATFORM_KEYWORDS).join("|") + ")\\b",
      "gi"
    );

    // Keep track of which keywords have been linked already to avoid duplicates
    const linkedKeywords = new Set<string>();

    return textContent.replace(keywordPattern, (match) => {
      const lowerMatch = match.toLowerCase();
      // Only link the first occurrence of each keyword
      if (!linkedKeywords.has(lowerMatch)) {
        linkedKeywords.add(lowerMatch);
        const url =
          PLATFORM_KEYWORDS[lowerMatch as keyof typeof PLATFORM_KEYWORDS];
        return `<a href="${url}" class="platform-link ${styles.platformLink}">${match}</a>`;
      }
      return match;
    });
  };

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element) {
        // Add structured data attributes for SEO
        if (
          domNode.name === "h1" ||
          domNode.name === "h2" ||
          domNode.name === "h3"
        ) {
          return (
            <domNode.name
              className={
                domNode.name === "h1"
                  ? "text-4xl md:text-5xl font-bold mb-6 mt-12 relative pl-3 border-l-4 border-[#ff0884]"
                  : domNode.name === "h2"
                  ? "text-3xl md:text-4xl font-bold mb-5 mt-10 bg-gradient-to-r from-[#ff0884] to-purple-600 bg-clip-text text-transparent"
                  : "text-2xl md:text-3xl font-bold mb-4 mt-8 text-white"
              }
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </domNode.name>
          );
        }

        if (domNode.name === "p") {
          // Get text content and process it for platform links
          const textContent = domToReact(domNode.children as DOMNode[]);
          const textWithLinks = addPlatformLinks(String(textContent));

          // If the content was modified with links, use the HTML parser again
          if (textWithLinks !== String(textContent)) {
            return (
              <p className="mb-6 leading-relaxed">{parse(textWithLinks)}</p>
            );
          }
        }

        if (domNode.name === "pre") {
          return (
            <pre
              className={`${styles.codeBlock} my-8 p-4 bg-gray-800 rounded-lg overflow-auto relative`}
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </pre>
          );
        }
      }
      return undefined;
    },
  };

  // Criar slug da categoria a partir do nome da categoria
  const categorySlug = post.category.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow ${robotoCondensed.className}`}>
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
            {post.cover_image && (
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
              className={`mt-10 prose prose-invert prose-lg max-w-none ${roboto.className} ${styles.markdown}`}
            >
              {parse(post.content, options)}
            </div>
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-700 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-[length:100%_1px] bg-no-repeat bg-top">
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
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gradient-to-r hover:from-[#ff0884]/20 hover:to-purple-500/20 transition-colors hover:text-white border border-gray-700 hover:border-[#ff0884]/40"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Posts Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.id}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-[#ff0884]/30 h-full flex flex-col"
                  >
                    <a href={`/blog/${relatedPost.slug}`} className="block">
                      <div className="relative h-40 w-full">
                        {relatedPost.cover_image ? (
                          <Image
                            src={relatedPost.cover_image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                            <span className="text-gray-400">Sem imagem</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                      </div>
                    </a>

                    <div className="p-4 flex-grow">
                      <a href={`/blog/${relatedPost.slug}`} className="block">
                        <h3 className="text-lg font-bold mb-2 hover:text-[#ff0884] transition-colors line-clamp-2 cursor-pointer">
                          {relatedPost.title}
                        </h3>
                      </a>
                      <div className="text-gray-400 text-sm">
                        {relatedPost.published_at && (
                          <time
                            dateTime={relatedPost.published_at}
                            className="flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-1"
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
                          </time>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <div className="mt-16 pt-8 border-t border-gray-700 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-[length:100%_1px] bg-no-repeat bg-top">
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
              Compartilhar
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-[#1DA1F2] to-[#0d8bd9] text-white p-3 rounded-lg hover:shadow-lg hover:shadow-[#1DA1F2]/20 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
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
                className="bg-gradient-to-br from-[#1877F2] to-[#0d63cf] text-white p-3 rounded-lg hover:shadow-lg hover:shadow-[#1877F2]/20 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
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
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${post.title} - ${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white p-3 rounded-lg hover:shadow-lg hover:shadow-[#25D366]/20 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
                aria-label="Compartilhar no WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.instagram.com/create/story?url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-[#E1306C] to-[#C13584] text-white p-3 rounded-lg hover:shadow-lg hover:shadow-[#E1306C]/20 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
                aria-label="Compartilhar no Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Comment Section - Can be implemented with a third-party service */}
          <div className="mt-16 pt-10 border-t border-gray-700 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-[length:100%_1px] bg-no-repeat bg-top">
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
            <div className="bg-gray-800/50 p-10 rounded-xl text-center shadow-xl border border-transparent bg-gradient-to-br from-gray-700/50 via-gray-800/50 to-gray-700/50 backdrop-blur-sm relative before:absolute before:inset-0 before:p-[1px] before:rounded-xl before:bg-gradient-to-br before:from-gray-600 before:via-[#ff0884]/30 before:to-purple-500/30 before:mask-gradient-border">
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
              <button className="bg-gradient-to-r from-[#ff0884] to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#ff0884]/20 transition-all duration-300 transform hover:-translate-y-1 font-medium flex items-center mx-auto">
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

      <Footer />
    </div>
  );
}
