
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, Category, Tag } from '@/types/blog';

export const useBlog = () => {
  const queryClient = useQueryClient();

  // Fetch published blog posts
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
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .eq('published', true);

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      // Fetch categories for each post
      const postsWithCategories = await Promise.all(
        data.map(async (post) => {
          const { data: categoriesData } = await supabase
            .from('blog_posts_categories')
            .select(`
              category_id,
              blog_categories!inner(id, name, slug)
            `)
            .eq('post_id', post.id);

          const categories = categoriesData?.map(item => {
            // Check if blog_categories exists and is an object
            const categoryData = item.blog_categories;
            return categoryData ? {
              id: categoryData.id || null,
              name: categoryData.name || null,
              slug: categoryData.slug || null
            } : {
              id: null,
              name: null,
              slug: null
            };
          }) || [];

          // Fetch tags for each post
          const { data: tagsData } = await supabase
            .from('blog_posts_tags')
            .select(`
              tag_id,
              blog_tags!inner(id, name, slug)
            `)
            .eq('post_id', post.id);

          const tags = tagsData?.map(item => {
            // Check if blog_tags exists and is an object
            const tagData = item.blog_tags;
            return tagData ? {
              id: tagData.id || null,
              name: tagData.name || null,
              slug: tagData.slug || null
            } : {
              id: null,
              name: null,
              slug: null
            };
          }) || [];

          // Safely access profiles data
          const profileData = post.profiles;
          const authorName = profileData ? 
            `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
            'Unknown';

          return {
            ...post,
            author_name: authorName,
            categories,
            tags
          };
        })
      );

      return postsWithCategories as BlogPost[];
    }
  });
  
  // Fetch all categories
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      
      return data as Category[];
    }
  });
  
  // Fetch all tags
  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
      
      return data as Tag[];
    }
  });

  return { posts, categories, tags, isLoading, error };
};

export const useAdminBlog = () => {
  const queryClient = useQueryClient();
  
  // Fetch all blog posts for admin
  const { data: allPosts = [], isLoading, error } = useQuery({
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
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      // Fetch categories for each post
      const postsWithCategories = await Promise.all(
        data.map(async (post) => {
          const { data: categoriesData } = await supabase
            .from('blog_posts_categories')
            .select(`
              category_id,
              blog_categories!inner(id, name, slug)
            `)
            .eq('post_id', post.id);

          const categories = categoriesData?.map(item => {
            // Check if blog_categories exists and is an object
            const categoryData = item.blog_categories;
            return categoryData ? {
              id: categoryData.id || null,
              name: categoryData.name || null,
              slug: categoryData.slug || null
            } : {
              id: null,
              name: null,
              slug: null
            };
          }) || [];

          // Fetch tags for each post
          const { data: tagsData } = await supabase
            .from('blog_posts_tags')
            .select(`
              tag_id,
              blog_tags!inner(id, name, slug)
            `)
            .eq('post_id', post.id);

          const tags = tagsData?.map(item => {
            // Check if blog_tags exists and is an object
            const tagData = item.blog_tags;
            return tagData ? {
              id: tagData.id || null,
              name: tagData.name || null,
              slug: tagData.slug || null
            } : {
              id: null,
              name: null,
              slug: null
            };
          }) || [];

          // Safely access profiles data
          const profileData = post.profiles;
          const authorName = profileData ? 
            `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
            'Unknown';

          return {
            ...post,
            author_name: authorName,
            categories,
            tags
          };
        })
      );

      return postsWithCategories as BlogPost[];
    }
  });
  
  // Fetch all categories
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      
      return data as Category[];
    }
  });
  
  // Fetch all tags
  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
      
      return data as Tag[];
    }
  });

  // Create a new blog post
  const createPost = useMutation({
    mutationFn: async ({ 
      post, 
      categoryIds, 
      tagIds 
    }: { 
      post: Omit<BlogPost, 'id' | 'categories' | 'tags' | 'author_name'>, 
      categoryIds: string[],
      tagIds: string[]
    }) => {
      // Insert the blog post
      const { data: newPost, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          featured_image: post.featured_image,
          published: post.published,
          published_at: post.published_at,
          author_id: post.author_id,
          created_at: post.created_at || new Date().toISOString(),
          updated_at: post.updated_at || new Date().toISOString()
        })
        .select()
        .single();

      if (postError) {
        throw new Error(`Error creating blog post: ${postError.message}`);
      }

      // Add categories
      if (categoryIds.length > 0) {
        const categoryLinks = categoryIds.map(categoryId => ({
          post_id: newPost.id,
          category_id: categoryId
        }));

        const { error: catError } = await supabase
          .from('blog_posts_categories')
          .insert(categoryLinks);

        if (catError) {
          console.error('Error linking categories:', catError);
        }
      }

      // Add tags
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map(tagId => ({
          post_id: newPost.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('blog_posts_tags')
          .insert(tagLinks);

        if (tagError) {
          console.error('Error linking tags:', tagError);
        }
      }

      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  // Update an existing blog post
  const updatePost = useMutation({
    mutationFn: async ({ 
      id, 
      post, 
      categoryIds, 
      tagIds 
    }: { 
      id: string, 
      post: Partial<Omit<BlogPost, 'id' | 'categories' | 'tags' | 'author_name'>>, 
      categoryIds: string[],
      tagIds: string[]
    }) => {
      // Update the blog post
      const { data: updatedPost, error: postError } = await supabase
        .from('blog_posts')
        .update({
          ...post,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (postError) {
        throw new Error(`Error updating blog post: ${postError.message}`);
      }

      // Remove existing category links
      const { error: deleteCatError } = await supabase
        .from('blog_posts_categories')
        .delete()
        .eq('post_id', id);

      if (deleteCatError) {
        console.error('Error removing categories:', deleteCatError);
      }

      // Add new category links
      if (categoryIds.length > 0) {
        const categoryLinks = categoryIds.map(categoryId => ({
          post_id: id,
          category_id: categoryId
        }));

        const { error: addCatError } = await supabase
          .from('blog_posts_categories')
          .insert(categoryLinks);

        if (addCatError) {
          console.error('Error linking categories:', addCatError);
        }
      }

      // Remove existing tag links
      const { error: deleteTagError } = await supabase
        .from('blog_posts_tags')
        .delete()
        .eq('post_id', id);

      if (deleteTagError) {
        console.error('Error removing tags:', deleteTagError);
      }

      // Add new tag links
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));

        const { error: addTagError } = await supabase
          .from('blog_posts_tags')
          .insert(tagLinks);

        if (addTagError) {
          console.error('Error linking tags:', addTagError);
        }
      }

      return updatedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  // Delete a blog post
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      // Delete will cascade to blog_posts_categories and blog_posts_tags due to foreign key constraints
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting blog post: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  // Create a new category
  const createCategory = useMutation({
    mutationFn: async ({ name, slug }: { name: string, slug: string }) => {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({ name, slug })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating category: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });

  // Create a new tag
  const createTag = useMutation({
    mutationFn: async ({ name, slug }: { name: string, slug: string }) => {
      const { data, error } = await supabase
        .from('blog_tags')
        .insert({ name, slug })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating tag: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });

  return { 
    allPosts, 
    categories, 
    tags, 
    isLoading, 
    error,
    createPost,
    updatePost,
    deletePost,
    createCategory,
    createTag
  };
};
