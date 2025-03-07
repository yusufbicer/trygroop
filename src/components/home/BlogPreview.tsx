import React from 'react';
import { BlogPost } from '@/types/blog';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, User, Clock } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';

interface BlogPreviewProps {
  posts?: BlogPost[];
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ posts: providedPosts }) => {
  // Use provided posts or fetch posts if not provided
  const { data: fetchedPosts = [], isLoading, error } = useBlog();
  const posts = providedPosts || fetchedPosts;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Show a loading state while fetching posts
  if (!providedPosts && isLoading) {
    return (
      <section id="blog" className="py-20 bg-groop-dark relative">
        <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-groop-surface backdrop-blur-sm border border-groop-blue/20 text-sm text-groop-cyan mb-6">
              Latest Updates
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-groop-accent mb-4">
              Latest From Our <span className="text-groop-cyan">Blog</span>
            </h2>
            <p className="text-groop-accent-muted max-w-2xl mx-auto">
              Stay updated with our latest news, insights, and announcements about global importing and shipping.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="h-full flex flex-col bg-groop-surface backdrop-blur-sm border border-groop-blue/10 shadow-lg">
                <div className="h-48 w-full bg-groop-blue/5 animate-pulse rounded-t-lg"></div>
                <CardHeader className="flex-grow">
                  <div className="w-1/3 h-4 bg-groop-blue/10 animate-pulse mb-2 rounded-full"></div>
                  <div className="w-full h-6 bg-groop-blue/10 animate-pulse rounded-md"></div>
                  <div className="mt-2 space-y-2">
                    <div className="w-full h-4 bg-groop-blue/10 animate-pulse rounded-md"></div>
                    <div className="w-2/3 h-4 bg-groop-blue/10 animate-pulse rounded-md"></div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-0">
                  <div className="w-1/3 h-4 bg-groop-blue/10 animate-pulse rounded-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (!providedPosts && error) {
    return (
      <section id="blog" className="py-20 bg-groop-dark relative">
        <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-groop-surface backdrop-blur-sm border border-groop-blue/20 text-sm text-groop-cyan mb-6">
              Latest Updates
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-groop-accent mb-4">
              Latest From Our <span className="text-groop-cyan">Blog</span>
            </h2>
            <p className="text-groop-accent-muted max-w-2xl mx-auto">
              Stay updated with our latest news, insights, and announcements about global importing and shipping.
            </p>
          </div>
          <div className="text-center text-groop-purple p-8 bg-groop-surface/50 backdrop-blur-sm rounded-lg border border-groop-purple/20">
            <p>There was an error loading the blog posts. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-groop-dark relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-groop-cyan/5 blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-groop-purple/5 blur-[120px]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-groop-surface backdrop-blur-sm border border-groop-blue/20 text-sm text-groop-cyan mb-6">
            Latest Updates
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-groop-accent mb-4">
            Latest From Our <span className="text-groop-cyan">Blog</span>
          </h2>
          <p className="text-groop-accent-muted max-w-2xl mx-auto">
            Stay updated with our latest news, insights, and announcements about global importing and shipping.
          </p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post) => (
              <Card key={post.id} className="h-full flex flex-col bg-groop-surface/80 backdrop-blur-sm border border-groop-blue/10 hover:border-groop-blue/30 transition-all duration-300 rounded-lg overflow-hidden">
                {post.featured_image && (
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                )}
                <CardHeader className="flex-grow">
                  <div className="flex items-center space-x-2 text-sm text-groop-accent-muted mb-2">
                    <Calendar className="h-4 w-4 text-groop-cyan" />
                    <span>{formatDate(post.created_at)}</span>
                    {post.author_name && (
                      <>
                        <span className="text-groop-blue/50">•</span>
                        <User className="h-4 w-4 text-groop-cyan" />
                        <span>{post.author_name}</span>
                      </>
                    )}
                  </div>
                  <CardTitle className="text-xl text-groop-accent">
                    <Link to={`/blog/${post.slug}`} className="hover:text-groop-cyan transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="mt-2 text-groop-accent-muted">
                    {post.excerpt || (post.content && post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content || '')}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button asChild variant="ghost" className="p-0 h-auto hover:bg-transparent">
                    <Link to={`/blog/${post.slug}`} className="flex items-center text-groop-cyan hover:text-groop-blue-light transition-colors">
                      Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-groop-blue/30 to-transparent"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-groop-surface/50 backdrop-blur-sm rounded-lg border border-groop-blue/10">
            <p className="text-groop-accent-muted">No blog posts available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white border-none shadow-md shadow-groop-blue/20 px-6">
            <Link to="/blog" className="flex items-center">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
