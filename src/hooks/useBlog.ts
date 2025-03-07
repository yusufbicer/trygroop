import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';

const fetchBlogs = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      published,
      featured_image,
      created_at,
      updated_at,
      published_at,
      author_id,
      profiles(first_name, last_name),
      blog_posts_categories(category_id, blog_categories(id, name, slug)),
      blog_posts_tags(tag_id, blog_tags(id, name, slug))
    `)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return data;
};

const fetchBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      published,
      featured_image,
      created_at,
      updated_at,
      published_at,
      author_id,
      profiles(first_name, last_name),
      blog_posts_categories(category_id, blog_categories(id, name, slug)),
      blog_posts_tags(tag_id, blog_tags(id, name, slug))
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }

  return data;
};

const getFormattedBlogs = (data: any[]) => {
  return data.map((post) => {
    // Process categories
    const categories = post.categories?.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id || null,
          name: item.name || null,
          slug: item.slug || null
        };
      }
      return { id: null, name: null, slug: null };
    }) || [];

    // Process tags
    const tags = post.tags?.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id || null,
          name: item.name || null,
          slug: item.slug || null
        };
      }
      return { id: null, name: null, slug: null };
    }) || [];

    // Process author information
    let authorName = 'Unknown Author';
    if (post.profiles && typeof post.profiles === 'object') {
      const firstName = post.profiles.first_name || '';
      const lastName = post.profiles.last_name || '';
      authorName = `${firstName} ${lastName}`.trim() || 'Unknown Author';
    }

    return {
      ...post,
      categories,
      tags,
      authorName
    };
  });
};

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const data = await fetchBlogs();
      return getFormattedBlogs(data);
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

const formatBlogPost = (post: any) => {
  if (!post) return null;

  // Process categories
  const categories = post.categories?.map((item: any) => {
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id || null,
        name: item.name || null,
        slug: item.slug || null
      };
    }
    return { id: null, name: null, slug: null };
  }) || [];

  // Process tags
  const tags = post.tags?.map((item: any) => {
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id || null,
        name: item.name || null,
        slug: item.slug || null
      };
    }
    return { id: null, name: null, slug: null };
  }) || [];

  // Process author information
  let authorName = 'Unknown Author';
  if (post.profiles && typeof post.profiles === 'object') {
    const firstName = post.profiles.first_name || '';
    const lastName = post.profiles.last_name || '';
    authorName = `${firstName} ${lastName}`.trim() || 'Unknown Author';
  }

  return {
    ...post,
    categories,
    tags,
    authorName
  };
};
