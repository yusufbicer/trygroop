import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost as BlogPostType } from '@/types/blog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Tag as TagIcon, Folder, User, ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { fetchPostBySlug, isLoading } = useBlog();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError('Post not found');
        return;
      }

      try {
        const postData = await fetchPostBySlug(slug);
        if (postData) {
          setPost(postData);
        } else {
          setError('Post not found');
        }
      } catch (err: any) {
        console.error('Error loading post:', err);
        setError(err.message || 'Failed to load blog post');
      }
    };

    loadPost();
  }, [slug, fetchPostBySlug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>
              {error || 'The blog post you are looking for does not exist.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Button asChild variant="outline" className="mb-8">
        <Link to="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden h-[400px]">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(post.created_at)}
            </div>
            
            {post.author_name && (
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {post.author_name}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.categories.map((category, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {category.name}
            </Badge>
          ))}
          {post.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <TagIcon className="h-3 w-3" />
              {tag.name}
            </Badge>
          ))}
        </div>

        <Separator className="mb-8" />

        <div className="prose prose-lg max-w-none">
          {/* This could be replaced with a markdown renderer */}
          {post.content.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
