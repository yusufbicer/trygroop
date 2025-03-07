// Blog-related type definitions for use with Supabase
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

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
  categories: Category[];
  tags: Tag[];
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
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

// Type for blog post with full category and tag data
export interface BlogPostWithRelations extends BlogPost {
  categories: Category[];
  tags: Tag[];
}

// Extend the PostgrestQueryBuilder to handle blog tables
interface BlogTables {
  blog_posts: {
    Row: {
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
    };
    Insert: {
      id?: string;
      title: string;
      slug: string;
      content: string;
      excerpt?: string | null;
      published?: boolean;
      featured_image?: string | null;
      created_at?: string;
      updated_at?: string;
      published_at?: string | null;
      author_id: string;
    };
    Update: {
      id?: string;
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string | null;
      published?: boolean;
      featured_image?: string | null;
      created_at?: string;
      updated_at?: string;
      published_at?: string | null;
      author_id?: string;
    };
  };
  blog_categories: {
    Row: {
      id: string;
      name: string;
      slug: string;
      created_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      slug: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      name?: string;
      slug?: string;
      created_at?: string;
    };
  };
  blog_tags: {
    Row: {
      id: string;
      name: string;
      slug: string;
      created_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      slug: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      name?: string;
      slug?: string;
      created_at?: string;
    };
  };
  blog_posts_categories: {
    Row: {
      post_id: string;
      category_id: string;
    };
    Insert: {
      post_id: string;
      category_id: string;
    };
    Update: {
      post_id?: string;
      category_id?: string;
    };
  };
  blog_posts_tags: {
    Row: {
      post_id: string;
      tag_id: string;
    };
    Insert: {
      post_id: string;
      tag_id: string;
    };
    Update: {
      post_id?: string;
      tag_id?: string;
    };
  };
}

// Extend the Database type to include blog tables
export interface ExtendedDatabase extends Database {
  public: {
    Tables: Database['public']['Tables'] & BlogTables;
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}

// Custom Supabase client type with blog tables
export type CustomSupabaseClient = SupabaseClient<ExtendedDatabase> & {
  from<T extends keyof ExtendedDatabase['public']['Tables']>(
    table: T
  ): ReturnType<SupabaseClient<ExtendedDatabase>['from']>;
};
