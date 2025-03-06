
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CustomCard, CustomCardHeader, CustomCardContent, CustomCardFooter } from '../ui/CustomCard';
import { CustomButton } from '../ui/CustomButton';
import { BlogPost, CustomSupabaseClient } from '@/types/blog';

// Type assertion for Supabase client to handle blog tables
const customSupabase = supabase as unknown as CustomSupabaseClient;

const BlogPreview = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await customSupabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id (first_name, last_name)
        `)
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Format posts with author names
      const formattedPosts = (data || []).map(post => {
        const authorFirstName = post.profiles?.first_name || '';
        const authorLastName = post.profiles?.last_name || '';
        const authorName = authorFirstName || authorLastName 
          ? `${authorFirstName} ${authorLastName}`.trim()
          : 'Anonymous';

        return {
          ...post,
          author_name: authorName,
          categories: [],
          tags: []
        } as BlogPost;
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="blog" className="py-20 bg-groop-darker relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6">
              Latest Articles
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Insights & Resources
            </h2>
            <p className="text-white/70 max-w-2xl">
              Explore our latest articles on shipping consolidation, documentation, and international trade.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link to="/blog" className="text-groop-blue hover:text-groop-blue-light transition-colors flex items-center gap-2">
              <span>View all articles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-white mb-2">No blog posts yet</h3>
            <p className="text-white/70">Check back soon for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CustomCard interactive glassEffect className="h-full flex flex-col">
                  <CustomCardHeader>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-groop-blue/10 text-groop-blue">
                        Blog
                      </span>
                      <span className="text-white/50 text-sm">
                        {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                  </CustomCardHeader>
                  <CustomCardContent className="flex-grow">
                    <p className="text-white/70 mb-4">
                      {post.excerpt || post.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
                    </p>
                  </CustomCardContent>
                  <CustomCardFooter>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-groop-blue/20 flex items-center justify-center">
                        <span className="text-white font-medium">{post.author_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{post.author_name}</p>
                        <p className="text-white/50 text-xs">
                          {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <CustomButton variant="ghost" size="sm">
                        Read more
                      </CustomButton>
                    </Link>
                  </CustomCardFooter>
                </CustomCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPreview;
