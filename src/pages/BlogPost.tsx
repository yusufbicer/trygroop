
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChevronLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          content,
          featured_image,
          created_at,
          published_at,
          author_id,
          profiles:author_id(first_name, last_name)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        return null;
      }

      return {
        ...data,
        author_name: data.profiles ? 
          `${data.profiles.first_name || ''} ${data.profiles.last_name || ''}`.trim() : 
          'Unknown'
      };
    }
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-primary mb-4">
              <ChevronLeft size={16} className="mr-1" />
              Back to all posts
            </Link>
            
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary mb-4 ml-4">
              <ChevronLeft size={16} className="mr-1" />
              Back to home
            </Link>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ) : post ? (
            <article>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-8">
                <div className="flex items-center mr-6">
                  <User size={16} className="mr-2" />
                  <span>{post.author_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
              </div>
              
              {post.featured_image && (
                <div className="mb-8">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <div 
                className="prose prose-lg max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <div className="mt-12 pt-6 border-t border-gray-200">
                <Button asChild>
                  <Link to="/blog">View All Posts</Link>
                </Button>
              </div>
            </article>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h2>
              <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link to="/blog">Browse All Posts</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
