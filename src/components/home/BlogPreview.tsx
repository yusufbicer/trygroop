
import React from 'react';
import { BlogPost } from '@/types/blog';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Tag as TagIcon, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPreviewProps {
  posts: BlogPost[];
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ posts }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest From Our Blog</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest news, insights, and announcements about global importing and shipping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post) => (
            <Card key={post.id} className="h-full flex flex-col">
              {post.featured_image && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="flex-grow">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <CardTitle className="text-xl">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="mt-2">
                  {post.excerpt || post.content.substring(0, 120) + '...'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button asChild variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <Link to={`/blog/${post.slug}`} className="flex items-center text-primary">
                    Read more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild>
            <Link to="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
