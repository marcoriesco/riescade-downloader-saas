import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
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
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Roboto, Roboto_Condensed } from "next/font/google";
import styles from "../../../styles/markdown.module.css";

// Define platform keywords and their corresponding URLs
const PLATFORM_KEYWORDS = {
  gameboy: "/platforms/gameboy",
  nintendo: "/platforms/nintendo",
  playstation: "/platforms/playstation",
  sega: "/platforms/sega",
  xbox: "/platforms/xbox",
  atari: "/platforms/atari",
  dreamcast: "/platforms/dreamcast",
  nes: "/platforms/nes",
  snes: "/platforms/snes",
  n64: "/platforms/n64",
  genesis: "/platforms/genesis",
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
  cover_image: string;
  published_at: string | null;
  category: string;
  reading_time: number;
  author: string;
  author_image: string;
  tags: string[];
  views: number;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post não encontrado",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : [],
      tags: post.tags,
      siteName: "RIESCADE",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      creator: "@riescade",
      site: "@riescade",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = use(getBlogPostBySlug(slug));

  if (!post) {
    notFound();
  }

  // Update view count
  updatePostViews(post.id);

  // Get related posts
  const relatedPosts = use(getRelatedPosts(post, 3));

  // Create category slug from category name
  const categorySlug = post.category.toLowerCase().replace(/\s+/g, "-");

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

            {/* Add schema.org metadata for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  headline: post.title,
                  image: post.cover_image ? [post.cover_image] : [],
                  datePublished: post.published_at,
                  author: {
                    "@type": "Person",
                    name: post.author,
                  },
                  publisher: {
                    "@type": "Organization",
                    name: "RIESCADE",
                    logo: {
                      "@type": "ImageObject",
                      url: "/images/logos.webp",
                    },
                  },
                  description: post.excerpt,
                }),
              }}
            />

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
                {post.tags.map((tag) => (
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
          {relatedPosts.length > 0 && (
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
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
                Posts Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    className="bg-gray-800/50 rounded-lg overflow-hidden shadow-xl hover:shadow-[0_0_15px_rgba(255,8,132,0.15)] transition-all duration-300 hover:-translate-y-1 group relative after:absolute after:inset-0 after:z-[-1] after:bg-gradient-to-br after:from-[#ff0884]/20 after:to-purple-500/20 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
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
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                )}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-[#0077B5] to-[#005885] text-white p-3 rounded-lg hover:shadow-lg hover:shadow-[#0077B5]/20 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
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
              <p className={`${roboto.className} text-gray-400 mt-2`}>
                RetroGames e Games, sempre emulando...
              </p>
            </div>

            {/* Redes Sociais */}
            <div className="mt-8 flex flex-col space-y-4">
              <div className={`${roboto.className} flex space-x-6`}>
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
