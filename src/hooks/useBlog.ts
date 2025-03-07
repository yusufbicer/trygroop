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
    // Process categories from blog_posts_categories relation
    const categories = post.blog_posts_categories?.map((item: any) => {
      if (item.blog_categories && typeof item.blog_categories === 'object') {
        return {
          id: item.blog_categories.id || null,
          name: item.blog_categories.name || null,
          slug: item.blog_categories.slug || null
        };
      }
      return { id: null, name: null, slug: null };
    }) || [];
    
    // Process tags from blog_posts_tags relation
    const tags = post.blog_posts_tags?.map((item: any) => {
      if (item.blog_tags && typeof item.blog_tags === 'object') {
        return {
          id: item.blog_tags.id || null,
          name: item.blog_tags.name || null,
          slug: item.blog_tags.slug || null
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

export const useBlog = useBlogs; // Add alias for backward compatibility

export const useAdminBlog = () => {
  return useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin blog posts:', error);
        throw error;
      }

      return data;
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

// Admin operations
export const createBlogPost = async (postData: Partial<BlogPost>) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([postData])
    .select();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  return data?.[0];
};

export const updateBlogPost = async (postId: string, postData: Partial<BlogPost>) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(postData)
    .eq('id', postId)
    .select();

  if (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }

  return data?.[0];
};

export const deleteBlogPost = async (postId: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }

  return true;
};

// Category and tag operations
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data;
};

export const getTags = async () => {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }

  return data;
};


  return {
    ...post,
    categories,
    tags,
    authorName
  };
};
