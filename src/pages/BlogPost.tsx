import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

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
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        return;
      }

      // Fetch categories for the post
      const { data: categoriesData } = await supabase
        .from('blog_posts_categories')
        .select(`
          category_id,
          blog_categories!inner(id, name, slug)
        `)
        .eq('post_id', data.id);

      const categories = categoriesData?.map(item => {
        // Check if blog_categories exists and is an object
        const categoryData = item.blog_categories;
        if (categoryData && typeof categoryData === 'object') {
          return {
            id: categoryData.id || null,
            name: categoryData.name || null,
            slug: categoryData.slug || null
          };
        }
        return { id: null, name: null, slug: null };
      }) || [];

      // Fetch tags for the post
      const { data: tagsData } = await supabase
        .from('blog_posts_tags')
        .select(`
          tag_id,
          blog_tags!inner(id, name, slug)
        `)
        .eq('post_id', data.id);

      const tags = tagsData?.map(item => {
        // Check if blog_tags exists and is an object
        const tagData = item.blog_tags;
        if (tagData && typeof tagData === 'object') {
          return {
            id: tagData.id || null,
            name: tagData.name || null,
            slug: tagData.slug || null
          };
        }
        return { id: null, name: null, slug: null };
      }) || [];

      setPost({
        ...data,
        categories,
        tags
      } as BlogPost);
    };

    fetchPost();
  }, [slug]);

  // Fix the author name handling in the component
  const authorName = () => {
    if (!post?.profiles) return 'Unknown Author';
    
    const profileData = post.profiles;
    if (profileData && typeof profileData === 'object') {
      const firstName = profileData.first_name || '';
      const lastName = profileData.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Author';
    }
    
    return 'Unknown Author';
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-groop-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">{post.title}</CardTitle>
          <CardDescription className="text-white/70">
            By {authorName()} | Published on {format(new Date(post.published_at || post.created_at), 'MMMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.categories && post.categories.length > 0 && (
            <div className="flex items-center space-x-2">
              {post.categories.map(category => (
                <Badge key={category.id}>{category.name}</Badge>
              ))}
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              {post.tags.map(tag => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
          )}
          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} className="rounded-md" />
          )}
          <div className="text-white" dangerouslySetInnerHTML={{ __html: post.content }} />
          <Link to="/blog" className="text-groop-blue hover:underline">
            Back to Blog
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPost;
