
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost as BlogPostType } from '@/types/blog';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);

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

      let categories = [];
      if (categoriesData) {
        categories = categoriesData.map(item => {
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
        });
      }

      // Fetch tags for the post
      const { data: tagsData } = await supabase
        .from('blog_posts_tags')
        .select(`
          tag_id,
          blog_tags!inner(id, name, slug)
        `)
        .eq('post_id', data.id);

      let tags = [];
      if (tagsData) {
        tags = tagsData.map(item => {
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
        });
      }

      const profileData = data.profiles;
      const authorProfile = profileData && typeof profileData === 'object' ? profileData : null;

      setPost({
        ...data,
        categories,
        tags,
        profiles: authorProfile
      } as BlogPostType);
    };

    fetchPost();
  }, [slug]);

  // Fix the author name handling in the component
  const authorName = () => {
    if (!post || !post.profiles) return 'Unknown Author';
    
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
          <div className="flex items-center mb-4">
            <Link to="/blog" className="flex items-center text-groop-blue hover:underline mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog
            </Link>
          </div>
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
          <Link to="/" className="text-groop-blue hover:underline block mt-8">
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPost;
