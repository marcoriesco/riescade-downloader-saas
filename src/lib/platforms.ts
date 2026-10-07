import "server-only";

import { unstable_cache } from "next/cache";
import platformsJson from "@/data/platforms.json";
import platformImages from "@/data/platform-images.json";
import gamesCatalog from "@/data/games-catalog.json";
import {
  PLATFORM_CONTENT,
  PLATFORM_KIND_LABELS,
  type PlatformContent,
  type PlatformKind,
} from "@/data/platform-content";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export interface Platform {
  slug: string;
  name: string;
  content: PlatformContent | null;
  kindLabel: string | null;
  image: string | null;
  logo: string | null;
  extensions: string[];
  /** Only platforms with real content are indexed and listed in the sitemap. */
  indexable: boolean;
}

const images = platformImages as Record<string, { system?: string; logo?: string }>;
const extensionsById = new Map(
  (gamesCatalog as { platforms: { id: string; extensions?: string[] }[] }).platforms.map((p) => [
    p.id,
    p.extensions ?? [],
  ])
);

export const PLATFORMS: Platform[] = (platformsJson as { name: string; fullName: string }[])
  .map(({ name, fullName }) => {
    const content = PLATFORM_CONTENT[name] ?? null;
    return {
      slug: name,
      name: fullName,
      content,
      kindLabel: content ? PLATFORM_KIND_LABELS[content.kind] : null,
      image: images[name]?.system ?? null,
      logo: images[name]?.logo ?? null,
      extensions: extensionsById.get(name) ?? [],
      indexable: Boolean(content),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function getPlatform(slug: string): Platform | undefined {
  return PLATFORMS.find((platform) => platform.slug === slug);
}

export const KIND_ORDER: PlatformKind[] = [
  "console",
  "portable",
  "arcade",
  "computer",
  "peripheral",
  "engine",
  "system",
  "collection",
];

export function relatedPlatforms(platform: Platform, limit = 6): Platform[] {
  if (!platform.content) return [];
  const { maker, kind } = platform.content;
  const score = (other: Platform) =>
    (other.content?.maker === maker ? 2 : 0) + (other.content?.kind === kind ? 1 : 0);
  return PLATFORMS.filter((other) => other.indexable && other.slug !== platform.slug && score(other) > 0)
    .sort((a, b) => score(b) - score(a) || (a.content?.year ?? 0) - (b.content?.year ?? 0))
    .slice(0, limit);
}

// Counts are informative only; a failure must never break the page.
export const getPlatformGameCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    try {
      const counts: Record<string, number> = {};
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await getSupabaseAdmin()
          .from("download_assets")
          .select("platform")
          .eq("category", "rom")
          .eq("active", true)
          .neq("filename", "_media.zip")
          .order("id")
          .range(offset, offset + pageSize - 1);
        if (error) throw error;
        for (const row of data ?? []) {
          if (row.platform) counts[row.platform] = (counts[row.platform] ?? 0) + 1;
        }
        if (!data || data.length < pageSize) break;
      }
      return counts;
    } catch (error) {
      console.error("Platform game counts failed:", error);
      return {};
    }
  },
  ["platform-game-counts"],
  { revalidate: 86_400 }
);
