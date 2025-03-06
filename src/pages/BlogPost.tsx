
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Tag, Calendar, ArrowLeft, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import NotFound from './NotFound';
import { BlogPost as BlogPostType, CustomSupabaseClient } from '@/types/blog';

// Type assertion for Supabase client to handle blog tables
const customSupabase = supabase as unknown as CustomSupabaseClient;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug);
    }
  }, [slug]);

  const fetchBlogPost = async (postSlug: string) => {
    setLoading(true);
    try {
      // Fetch blog post by slug
      const { data: postData, error } = await customSupabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id (first_name, last_name)
        `)
        .eq('slug', postSlug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
        return;
      }

      // Fetch categories for the post
      const { data: categoriesData } = await customSupabase
        .from('blog_posts_categories')
        .select(`
          blog_categories (name, slug)
        `)
        .eq('post_id', postData.id);

      // Fetch tags for the post
      const { data: tagsData } = await customSupabase
        .from('blog_posts_tags')
        .select(`
          blog_tags (name, slug)
        `)
        .eq('post_id', postData.id);

      // Format author name
      const authorFirstName = postData.profiles?.first_name || '';
      const authorLastName = postData.profiles?.last_name || '';
      const authorName = authorFirstName || authorLastName 
        ? `${authorFirstName} ${authorLastName}`.trim()
        : 'Anonymous';

      const formattedPost = {
        ...postData,
        author_name: authorName,
        categories: (categoriesData || []).map((item) => item.blog_categories) || [],
        tags: (tagsData || []).map((item) => item.blog_tags) || []
      } as BlogPostType;

      setPost(formattedPost);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
          </Button>
        </Link>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
          </div>
        ) : post ? (
          <>
            {post.featured_image && (
              <div className="w-full h-96 bg-gray-200 overflow-hidden rounded-lg mb-8">
                <img 
                  src={post.featured_image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
              </span>
              {post.author_name && (
                <span className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {post.author_name}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">{post.title}</h1>

            {/* Categories and tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.categories.map((category) => (
                <Link key={category.slug} to={`/blog?category=${category.slug}`}>
                  <Badge variant="outline" className="hover:bg-primary/10">
                    {category.name}
                  </Badge>
                </Link>
              ))}
              
              {post.tags.map((tag) => (
                <Link key={tag.slug} to={`/blog?tag=${tag.slug}`}>
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    <Tag className="h-3 w-3 mr-1" /> {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <Separator className="mb-8" />

            {/* Post content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <Separator className="my-12" />

            {/* Author bio */}
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 rounded-full p-3">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">About the author</h3>
                    <p className="text-white/70">{post.author_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BlogPost;
