import { permanentRedirect } from "next/navigation";
import { getBlogFilters } from "@/lib/blog-service";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Category archives live at /blog?category=<name>; this old route only redirects there.
export default async function CategoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories } = await getBlogFilters();
  const match = categories.find((category) => slugify(category.name) === slugify(slug));
  permanentRedirect(match ? `/blog?category=${encodeURIComponent(match.name)}` : "/blog");
}
