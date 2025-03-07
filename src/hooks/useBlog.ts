import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      return getFormattedBlogs(data || []);
    },
  });
};

export const useBlog = useBlogs; // Add alias for backward compatibility

export const useAdminBlog = () => {
  const queryClient = useQueryClient();

  // Fetch all blog posts for admin
  const { data: allPostsData = [], isLoading, error } = useQuery({
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

      return getFormattedBlogs(data || []);
    },
  });

  // Fetch categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: getCategories,
  });

  // Fetch tags
  const { data: tagsData = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: getTags,
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async ({ 
      post, 
      categoryIds, 
      tagIds 
    }: { 
      post: Partial<BlogPost>; 
      categoryIds: string[]; 
      tagIds: string[]; 
    }) => {
      // Start a Supabase transaction
      const { data: newPost, error: postError } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (postError) {
        console.error('Error creating blog post:', postError);
        throw postError;
      }

      if (!newPost) {
        throw new Error('Failed to create blog post: No data returned');
      }

      const postId = newPost.id;

      // Add categories
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('blog_posts_categories')
          .insert(categoryRelations);

        if (categoriesError) {
          console.error('Error adding categories to post:', categoriesError);
          // Don't throw here, continue with tags
        }
      }

      // Add tags
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        }));

        const { error: tagsError } = await supabase
          .from('blog_posts_tags')
          .insert(tagRelations);

        if (tagsError) {
          console.error('Error adding tags to post:', tagsError);
          // Don't throw here, post is already created
        }
      }

      return newPost;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  // Update post mutation
  const updatePost = useMutation({
    mutationFn: async ({ 
      id, 
      post, 
      categoryIds, 
      tagIds 
    }: { 
      id: string; 
      post: Partial<BlogPost>; 
      categoryIds: string[]; 
      tagIds: string[]; 
    }) => {
      // Update the post
      const { data: updatedPost, error: postError } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();

      if (postError) {
        console.error('Error updating blog post:', postError);
        throw postError;
      }

      if (!updatedPost) {
        throw new Error('Failed to update blog post: No data returned');
      }

      // Delete existing category relations
      const { error: deleteCategoriesError } = await supabase
        .from('blog_posts_categories')
        .delete()
        .eq('post_id', id);

      if (deleteCategoriesError) {
        console.error('Error removing existing categories:', deleteCategoriesError);
        // Continue anyway
      }

      // Add new category relations
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(categoryId => ({
          post_id: id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('blog_posts_categories')
          .insert(categoryRelations);

        if (categoriesError) {
          console.error('Error updating categories:', categoriesError);
          // Continue anyway
        }
      }

      // Delete existing tag relations
      const { error: deleteTagsError } = await supabase
        .from('blog_posts_tags')
        .delete()
        .eq('post_id', id);

      if (deleteTagsError) {
        console.error('Error removing existing tags:', deleteTagsError);
        // Continue anyway
      }

      // Add new tag relations
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));

        const { error: tagsError } = await supabase
          .from('blog_posts_tags')
          .insert(tagRelations);

        if (tagsError) {
          console.error('Error updating tags:', tagsError);
          // Continue anyway
        }
      }

      return updatedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      // Delete category relations first
      const { error: categoriesError } = await supabase
        .from('blog_posts_categories')
        .delete()
        .eq('post_id', id);

      if (categoriesError) {
        console.error('Error deleting category relations:', categoriesError);
        // Continue anyway
      }

      // Delete tag relations
      const { error: tagsError } = await supabase
        .from('blog_posts_tags')
        .delete()
        .eq('post_id', id);

      if (tagsError) {
        console.error('Error deleting tag relations:', tagsError);
        // Continue anyway
      }

      // Delete the post
      const { error: postError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (postError) {
        console.error('Error deleting blog post:', postError);
        throw postError;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (category: { name: string; slug: string }) => {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([category])
        .select();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });

  // Create tag mutation
  const createTag = useMutation({
    mutationFn: async (tag: { name: string; slug: string }) => {
      const { data, error } = await supabase
        .from('blog_tags')
        .insert([tag])
        .select();

      if (error) {
        console.error('Error creating tag:', error);
        throw error;
      }

      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });

  return {
    allPosts: allPostsData,
    categories: categoriesData,
    tags: tagsData,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
    createCategory,
    createTag
  };
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

  // Process tags
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

  return data || [];
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

  return data || [];
};
