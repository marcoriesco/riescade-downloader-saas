import localCovers from "@/data/blog-covers.json";

const covers = localCovers as Record<string, string>;

// Covers downloaded by scripts/localize-blog-covers.mjs replace slow remote URLs.
export function withLocalCover<T extends { slug: string; cover_image: string | null }>(post: T): T {
  const local = covers[post.slug];
  return local ? { ...post, cover_image: local } : post;
}
