
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';

export const useBlog = () => {
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['blog-posts'],
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
          profiles:author_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .eq('published', true);

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data.map((post: any) => ({
        ...post,
        author_name: post.profiles ? 
          `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim() : 
          'Unknown'
      })) as BlogPost[];
    }
  });

  return { posts, isLoading, error };
};

export const useAdminBlog = () => {
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['admin-blog-posts'],
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
          profiles:author_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data.map((post: any) => ({
        ...post,
        author_name: post.profiles ? 
          `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim() : 
          'Unknown'
      })) as BlogPost[];
    }
  });

  return { posts, isLoading, error };
};
