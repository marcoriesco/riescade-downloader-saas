// Downloads externally generated blog covers (pollinations.ai) into public/ as WebP and
// records them in src/data/blog-covers.json, which the site prefers over the remote URL.
// Re-run after publishing posts with remote covers: node scripts/localize-blog-covers.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });
const OUT_DIR = "public/images/blog/covers";
const MAP_FILE = "src/data/blog-covers.json";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: posts, error } = await supabase
  .from("blog_posts")
  .select("slug,cover_image")
  .eq("status", "published")
  .like("cover_image", "http%");
if (error) throw error;

mkdirSync(OUT_DIR, { recursive: true });
const covers = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, "utf8")) : {};
const pending = posts.filter((post) => !covers[post.slug] || !existsSync(`public${covers[post.slug]}`));
console.log(`${posts.length} remote covers, ${pending.length} to download`);

async function localize({ slug, cover_image }) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(cover_image, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const file = `${OUT_DIR}/${slug}.webp`;
      await sharp(Buffer.from(await response.arrayBuffer()))
        .resize(1200, 630, { fit: "cover" })
        .webp({ quality: 76 })
        .toFile(file);
      covers[slug] = `/images/blog/covers/${slug}.webp`;
      return;
    } catch (err) {
      if (attempt === 3) console.error(`failed ${slug}: ${err.message}`);
    }
  }
}

const queue = [...pending];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) await localize(queue.shift());
  })
);
writeFileSync(MAP_FILE, JSON.stringify(Object.fromEntries(Object.entries(covers).sort()), null, 2) + "\n");
console.log(`${Object.keys(covers).length} covers mapped`);
