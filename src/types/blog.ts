export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  status: "draft" | "published" | "archived";
  author: string;
  author_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: string;
  reading_time: number;
  tags: string[];
  featured: boolean;
  views: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
  created_at: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  description: string | null;
  category: string;
  scheduled_date: string;
  status: "planned" | "in_progress" | "ready" | "published";
  assigned_to: string | null;
  post_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogStats {
  id: string;
  post_id: string;
  views: number;
  shares: number;
  likes: number;
  comments: number;
  avg_time_on_page: number;
  last_updated: string;
}

export interface BlogListProps {
  posts: BlogPost[];
  categories?: BlogCategory[];
  featured?: BlogPost[];
  totalPosts?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface BlogPostProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  categories?: BlogCategory[];
}

export interface CategoryPageProps {
  posts: BlogPost[];
  category: BlogCategory;
  categories: BlogCategory[];
  totalPosts?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface CalendarProps {
  entries: CalendarEntry[];
  categories: BlogCategory[];
}

export interface QueryParams {
  category?: string;
  tag?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}
