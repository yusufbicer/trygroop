import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost, Category, Tag } from '@/types/blog';

// Fetch all blog posts with their categories and tags
export const fetchBlogs = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_posts_categories(category_id, blog_categories(id, name, slug)),
      blog_posts_tags(tag_id, blog_tags(id, name, slug))
    `)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Format the blog post data
export const formatBlogPost = (post: any): BlogPost => {
  // Extract categories
  const categories: Category[] = post.blog_posts_categories
    ? post.blog_posts_categories
        .filter((cat: any) => cat.blog_categories)
        .map((cat: any) => cat.blog_categories)
    : [];

  // Extract tags
  const tags: Tag[] = post.blog_posts_tags
    ? post.blog_posts_tags
        .filter((tag: any) => tag.blog_tags)
        .map((tag: any) => tag.blog_tags)
    : [];

  return {
    ...post,
    categories,
    tags,
  };
};

// Fetch a single blog post by slug
export const fetchBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_posts_categories(category_id, blog_categories(id, name, slug)),
      blog_posts_tags(tag_id, blog_tags(id, name, slug))
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Fetch all categories
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Fetch all tags
export const fetchTags = async () => {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Hook to manage blog posts, categories, and tags
export const useBlog = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const posts = await fetchBlogs();
      const categories = await fetchCategories();
      const tags = await fetchTags();

      return {
        posts: posts.map(formatBlogPost),
        categories,
        tags,
      };
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      const post = await fetchBlogPost(slug);
      return formatBlogPost(post);
    },
    enabled: !!slug, // Ensure the query doesn't run without a slug
  });
};