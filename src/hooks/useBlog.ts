
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, Category, Tag } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useBlog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  // Fetch published blog posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['blog_posts', 'published'],
    queryFn: async () => {
      try {
        // Type assertion to make TypeScript happy
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Fetch author details
        const enrichedPosts = await Promise.all(
          (data || []).map(async (post) => {
            // Get author info
            const { data: authorData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', post.author_id)
              .single();
            
            // Get categories
            const { data: categoriesData } = await supabase
              .from('blog_posts_categories')
              .select(`
                category_id,
                blog_categories:category_id(id, name, slug)
              `)
              .eq('post_id', post.id);
            
            // Get tags
            const { data: tagsData } = await supabase
              .from('blog_posts_tags')
              .select(`
                tag_id,
                blog_tags:tag_id(id, name, slug)
              `)
              .eq('post_id', post.id);
            
            return {
              ...post,
              author_name: authorData ? `${authorData.first_name || ''} ${authorData.last_name || ''}`.trim() : '',
              categories: categoriesData?.map(item => item.blog_categories) || [],
              tags: tagsData?.map(item => item.blog_tags) || []
            } as BlogPost;
          })
        );
        
        return enrichedPosts;
      } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch blog posts',
          variant: 'destructive',
        });
        return [];
      }
    }
  });

  // Fetch all blog posts (for admin)
  const { data: allPosts = [], isLoading: isLoadingAllPosts } = useQuery({
    queryKey: ['blog_posts', 'all'],
    queryFn: async () => {
      try {
        if (!isAdmin) return [];
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Same enrichment as above
        const enrichedPosts = await Promise.all(
          (data || []).map(async (post) => {
            // Get author info
            const { data: authorData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', post.author_id)
              .single();
            
            // Get categories
            const { data: categoriesData } = await supabase
              .from('blog_posts_categories')
              .select(`
                category_id,
                blog_categories:category_id(id, name, slug)
              `)
              .eq('post_id', post.id);
            
            // Get tags
            const { data: tagsData } = await supabase
              .from('blog_posts_tags')
              .select(`
                tag_id,
                blog_tags:tag_id(id, name, slug)
              `)
              .eq('post_id', post.id);
            
            return {
              ...post,
              author_name: authorData ? `${authorData.first_name || ''} ${authorData.last_name || ''}`.trim() : '',
              categories: categoriesData?.map(item => item.blog_categories) || [],
              tags: tagsData?.map(item => item.blog_tags) || []
            } as BlogPost;
          })
        );
        
        return enrichedPosts;
      } catch (error: any) {
        console.error('Error fetching all blog posts:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch blog posts',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: isAdmin
  });

  // Fetch a single blog post by slug
  const fetchPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Get author info
      const { data: authorData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.author_id)
        .single();
      
      // Get categories
      const { data: categoriesData } = await supabase
        .from('blog_posts_categories')
        .select(`
          category_id,
          blog_categories:category_id(name, slug)
        `)
        .eq('post_id', data.id);
      
      // Get tags
      const { data: tagsData } = await supabase
        .from('blog_posts_tags')
        .select(`
          tag_id,
          blog_tags:tag_id(name, slug)
        `)
        .eq('post_id', data.id);
      
      return {
        ...data,
        author_name: authorData ? `${authorData.first_name || ''} ${authorData.last_name || ''}`.trim() : '',
        categories: categoriesData?.map(item => item.blog_categories) || [],
        tags: tagsData?.map(item => item.blog_tags) || []
      } as BlogPost;
    } catch (error: any) {
      console.error('Error fetching blog post by slug:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch blog post',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Fetch a single blog post by ID
  const fetchPostById = async (id: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Get author info
      const { data: authorData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.author_id)
        .single();
      
      // Get categories
      const { data: categoriesData } = await supabase
        .from('blog_posts_categories')
        .select(`
          category_id,
          blog_categories:category_id(name, slug)
        `)
        .eq('post_id', data.id);
      
      // Get tags
      const { data: tagsData } = await supabase
        .from('blog_posts_tags')
        .select(`
          tag_id,
          blog_tags:tag_id(name, slug)
        `)
        .eq('post_id', data.id);
      
      return {
        ...data,
        author_name: authorData ? `${authorData.first_name || ''} ${authorData.last_name || ''}`.trim() : '',
        categories: categoriesData?.map(item => item.blog_categories) || [],
        tags: tagsData?.map(item => item.blog_tags) || []
      } as BlogPost;
    } catch (error: any) {
      console.error('Error fetching blog post by ID:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch blog post',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Fetch all categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['blog_categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch categories',
          variant: 'destructive',
        });
        return [];
      }
    }
  });

  // Fetch all tags
  const { data: tags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ['blog_tags'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blog_tags')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching tags:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch tags',
          variant: 'destructive',
        });
        return [];
      }
    }
  });

  // Create blog post
  const createPost = useMutation({
    mutationFn: async ({
      post,
      categoryIds,
      tagIds
    }: {
      post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'categories' | 'tags'>;
      categoryIds: string[];
      tagIds: string[];
    }) => {
      setLoading(true);
      try {
        // 1. Insert the blog post
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            published: post.published,
            featured_image: post.featured_image,
            author_id: post.author_id,
            published_at: post.published ? new Date().toISOString() : null
          })
          .select()
          .single();
        
        if (postError) throw postError;
        
        // 2. Insert category relationships
        if (categoryIds.length > 0) {
          const categoryRelations = categoryIds.map(categoryId => ({
            post_id: postData.id,
            category_id: categoryId
          }));
          
          const { error: categoryError } = await supabase
            .from('blog_posts_categories')
            .insert(categoryRelations);
          
          if (categoryError) throw categoryError;
        }
        
        // 3. Insert tag relationships
        if (tagIds.length > 0) {
          const tagRelations = tagIds.map(tagId => ({
            post_id: postData.id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('blog_posts_tags')
            .insert(tagRelations);
          
          if (tagError) throw tagError;
        }
        
        return postData;
      } catch (error: any) {
        console.error('Error creating blog post:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create blog post',
        variant: 'destructive',
      });
    }
  });

  // Update blog post
  const updatePost = useMutation({
    mutationFn: async ({
      id,
      post,
      categoryIds,
      tagIds
    }: {
      id: string;
      post: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'categories' | 'tags'>>;
      categoryIds: string[];
      tagIds: string[];
    }) => {
      setLoading(true);
      try {
        // Update published_at if post is being published
        const updates: any = { ...post };
        if (post.published === true) {
          const { data: currentPost } = await supabase
            .from('blog_posts')
            .select('published, published_at')
            .eq('id', id)
            .single();
          
          if (!currentPost?.published_at) {
            updates.published_at = new Date().toISOString();
          }
        }
        
        // 1. Update the blog post
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (postError) throw postError;
        
        // 2. Delete existing category relationships
        const { error: deleteCategories } = await supabase
          .from('blog_posts_categories')
          .delete()
          .eq('post_id', id);
        
        if (deleteCategories) throw deleteCategories;
        
        // 3. Insert new category relationships
        if (categoryIds.length > 0) {
          const categoryRelations = categoryIds.map(categoryId => ({
            post_id: id,
            category_id: categoryId
          }));
          
          const { error: categoryError } = await supabase
            .from('blog_posts_categories')
            .insert(categoryRelations);
          
          if (categoryError) throw categoryError;
        }
        
        // 4. Delete existing tag relationships
        const { error: deleteTags } = await supabase
          .from('blog_posts_tags')
          .delete()
          .eq('post_id', id);
        
        if (deleteTags) throw deleteTags;
        
        // 5. Insert new tag relationships
        if (tagIds.length > 0) {
          const tagRelations = tagIds.map(tagId => ({
            post_id: id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('blog_posts_tags')
            .insert(tagRelations);
          
          if (tagError) throw tagError;
        }
        
        return postData;
      } catch (error: any) {
        console.error('Error updating blog post:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast({
        title: 'Success',
        description: 'Blog post updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update blog post',
        variant: 'destructive',
      });
    }
  });

  // Delete blog post
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      try {
        // The foreign key constraints should cascade deletes
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        return true;
      } catch (error: any) {
        console.error('Error deleting blog post:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  });

  // Create category
  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at'>) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .insert({
            name: category.name,
            slug: category.slug
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error creating category:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    }
  });

  // Create tag
  const createTag = useMutation({
    mutationFn: async (tag: Omit<Tag, 'id' | 'created_at'>) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_tags')
          .insert({
            name: tag.name,
            slug: tag.slug
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error creating tag:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_tags'] });
      toast({
        title: 'Success',
        description: 'Tag created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tag',
        variant: 'destructive',
      });
    }
  });

  return {
    // Queries
    posts,
    allPosts,
    categories,
    tags,
    isLoading: isLoadingPosts || isLoadingAllPosts || isLoadingCategories || isLoadingTags || loading,
    
    // Single post fetchers
    fetchPostBySlug,
    fetchPostById,
    
    // Mutations
    createPost,
    updatePost,
    deletePost,
    createCategory,
    createTag
  };
};
