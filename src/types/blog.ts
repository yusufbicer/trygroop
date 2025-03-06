
// Blog-related type definitions for use with Supabase
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  featured_image: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string;
  author_name?: string;
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// Custom type for Supabase that includes blog tables
export interface CustomSupabaseClient {
  from(table: 'blog_posts'): any;
  from(table: 'blog_categories'): any;
  from(table: 'blog_tags'): any;
  from(table: 'blog_posts_categories'): any;
  from(table: 'blog_posts_tags'): any;
  from(table: string): any;
}
