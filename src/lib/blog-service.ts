import { createClient } from "@supabase/supabase-js";
import {
  BlogPost,
  BlogCategory,
  CalendarEntry,
  BlogStats,
  QueryParams,
} from "../types/blog";

// Initialize Supabase client (client-side safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache e controle de throttle para evitar excesso de requisições
const cache = new Map<string, { data: unknown; timestamp: number }>();
const inFlight = new Map<string, boolean>();
const CACHE_TTL = 30000; // 30 segundos
const THROTTLE_TIME = 2000; // 2 segundos

// Função para throttle de requisições
async function throttledRequest<T>(
  cacheKey: string,
  requestFn: () => Promise<T>,
  ttl = CACHE_TTL
): Promise<T> {
  // Verificar se já temos dados em cache válidos
  const cachedItem = cache.get(cacheKey);
  const now = Date.now();

  if (cachedItem && now - cachedItem.timestamp < ttl) {
    return cachedItem.data as T;
  }

  // Verificar se já existe uma requisição em andamento para esta chave
  if (inFlight.get(cacheKey)) {
    // Se houver cache, mesmo expirado, retornar enquanto aguarda nova requisição
    if (cachedItem) {
      return cachedItem.data as T;
    }

    // Aguardar um pouco e tentar novamente
    await new Promise((resolve) => setTimeout(resolve, 500));
    return throttledRequest(cacheKey, requestFn, ttl);
  }

  try {
    // Marcar esta requisição como em andamento
    inFlight.set(cacheKey, true);

    // Executar a requisição
    const result = await requestFn();

    // Armazenar no cache
    cache.set(cacheKey, { data: result, timestamp: now });

    return result;
  } finally {
    // Liberar a flag de requisição em andamento
    inFlight.set(cacheKey, false);

    // Programar remoção da flag após o tempo de throttle
    setTimeout(() => {
      inFlight.delete(cacheKey);
    }, THROTTLE_TIME);
  }
}

// Posts
export async function getBlogPosts(
  params?: QueryParams
): Promise<{ data: BlogPost[]; count: number }> {
  try {
    let query = supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });

    // Apply filters
    if (params?.category) {
      query = query.eq("category", params.category);
    }

    if (params?.tag) {
      query = query.contains("tags", [params.tag]);
    }

    if (params?.featured) {
      query = query.eq("featured", true);
    }

    if (params?.search) {
      query = query.or(
        `title.ilike.%${params.search}%,content.ilike.%${params.search}%`
      );
    }

    // Pagination
    const limit = params?.limit || 10;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);
      return { data: [], count: 0 };
    }

    return { data: (data as BlogPost[]) || [], count: count || 0 };
  } catch (error) {
    console.error("Error in getBlogPosts:", error);
    return { data: [], count: 0 };
  }
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const cacheKey = `post-${slug}`;

  return throttledRequest(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        console.error("Error fetching blog post:", error);
        return null;
      }

      return data as BlogPost;
    } catch (error) {
      console.error("Error in getBlogPostBySlug:", error);
      return null;
    }
  });
}

export async function getRelatedPosts(
  post: BlogPost,
  limit = 3
): Promise<BlogPost[]> {
  const cacheKey = `related-${post.id}-${limit}`;

  return throttledRequest(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .eq("category", post.category)
        .neq("id", post.id)
        .limit(limit);

      if (error) {
        console.error("Error fetching related posts:", error);
        return [];
      }

      return data as BlogPost[];
    } catch (error) {
      console.error("Error in getRelatedPosts:", error);
      return [];
    }
  });
}

export async function getFeaturedPosts(limit = 5): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured posts:", error);
      return [];
    }

    return data as BlogPost[];
  } catch (error) {
    console.error("Error in getFeaturedPosts:", error);
    return [];
  }
}

export async function updatePostViews(postId: string): Promise<void> {
  // Só executa no cliente
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch(`/api/update-post-views?id=${postId}`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Erro ao atualizar visualizações:", error);
  }
}

// Categories
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching blog categories:", error);
      return [];
    }

    return data as BlogCategory[];
  } catch (error) {
    console.error("Error in getBlogCategories:", error);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<BlogCategory | null> {
  try {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching category:", error);
      return null;
    }

    return data as BlogCategory;
  } catch (error) {
    console.error("Error in getCategoryBySlug:", error);
    return null;
  }
}

// Calendar
export async function getCalendarEntries(): Promise<CalendarEntry[]> {
  try {
    const { data, error } = await supabase
      .from("blog_calendar")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (error) {
      console.error("Error fetching calendar entries:", error);
      return [];
    }

    return data as CalendarEntry[];
  } catch (error) {
    console.error("Error in getCalendarEntries:", error);
    return [];
  }
}

export async function createCalendarEntry(
  entry: Omit<CalendarEntry, "id" | "created_at" | "updated_at">
): Promise<CalendarEntry | null> {
  try {
    const { data, error } = await supabase
      .from("blog_calendar")
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error("Error creating calendar entry:", error);
      return null;
    }

    return data as CalendarEntry;
  } catch (error) {
    console.error("Error in createCalendarEntry:", error);
    return null;
  }
}

export async function updateCalendarEntry(
  id: string,
  updates: Partial<CalendarEntry>
): Promise<CalendarEntry | null> {
  try {
    const { data, error } = await supabase
      .from("blog_calendar")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating calendar entry:", error);
      return null;
    }

    return data as CalendarEntry;
  } catch (error) {
    console.error("Error in updateCalendarEntry:", error);
    return null;
  }
}

// Stats
export async function getBlogPostStats(
  postId: string
): Promise<BlogStats | null> {
  try {
    const { data, error } = await supabase
      .from("blog_stats")
      .select("*")
      .eq("post_id", postId)
      .single();

    if (error) {
      console.error("Error fetching blog stats:", error);
      return null;
    }

    return data as BlogStats;
  } catch (error) {
    console.error("Error in getBlogPostStats:", error);
    return null;
  }
}

// Admin functions
export async function createBlogPost(
  post: Omit<BlogPost, "id" | "created_at" | "updated_at">
): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([post])
      .select()
      .single();

    if (error) {
      console.error("Error creating blog post:", error);
      return null;
    }

    return data as BlogPost;
  } catch (error) {
    console.error("Error in createBlogPost:", error);
    return null;
  }
}

export async function updateBlogPost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    return null;
  }

  return data as BlogPost;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting blog post:", error);
    return false;
  }

  return true;
}

export async function createCategory(
  category: Omit<BlogCategory, "id" | "post_count" | "created_at">
): Promise<BlogCategory | null> {
  const { data, error } = await supabase
    .from("blog_categories")
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return null;
  }

  return data as BlogCategory;
}

export async function updateCategory(
  id: string,
  updates: Partial<BlogCategory>
): Promise<BlogCategory | null> {
  const { data, error } = await supabase
    .from("blog_categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return null;
  }

  return data as BlogCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("blog_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return false;
  }

  return true;
}

// Database functions for stored procedures
export async function publishScheduledPosts(): Promise<{
  success: boolean;
  count: number;
}> {
  const { data, error } = await supabase.rpc("publish_scheduled_posts");

  if (error) {
    console.error("Error publishing scheduled posts:", error);
    return { success: false, count: 0 };
  }

  return { success: true, count: data || 0 };
}
