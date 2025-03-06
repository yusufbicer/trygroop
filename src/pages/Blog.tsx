
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Tag, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { BlogPost, CustomSupabaseClient } from '@/types/blog';

// Type assertion for Supabase client to handle blog tables
const customSupabase = supabase as unknown as CustomSupabaseClient;

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([]);
  const [tags, setTags] = useState<{ name: string; slug: string; count: number }[]>([]);

  useEffect(() => {
    fetchBlogPosts();
    fetchCategoriesAndTags();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      // Fetch blog posts that are published
      const { data: postsData, error: postsError } = await customSupabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id (first_name, last_name)
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch categories for each post
      const postsWithCategories = await Promise.all((postsData || []).map(async (post) => {
        // Get categories
        const { data: categoriesData } = await customSupabase
          .from('blog_posts_categories')
          .select(`
            blog_categories (name, slug)
          `)
          .eq('post_id', post.id);

        // Get tags
        const { data: tagsData } = await customSupabase
          .from('blog_posts_tags')
          .select(`
            blog_tags (name, slug)
          `)
          .eq('post_id', post.id);

        // Format author name
        const authorFirstName = post.profiles?.first_name || '';
        const authorLastName = post.profiles?.last_name || '';
        const authorName = authorFirstName || authorLastName 
          ? `${authorFirstName} ${authorLastName}`.trim()
          : 'Anonymous';

        return {
          ...post,
          author_name: authorName,
          categories: (categoriesData || []).map(item => item.blog_categories) || [],
          tags: (tagsData || []).map(item => item.blog_tags) || []
        } as BlogPost;
      }));

      setPosts(postsWithCategories);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndTags = async () => {
    try {
      // Fetch all categories
      const { data: categoriesData } = await customSupabase
        .from('blog_categories')
        .select('*')
        .order('name');

      // Fetch post counts for each category
      const categoriesWithCount = await Promise.all((categoriesData || []).map(async (category) => {
        const { count } = await customSupabase
          .from('blog_posts_categories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        return {
          ...category,
          count: count || 0
        };
      }));

      setCategories(categoriesWithCount);

      // Fetch all tags
      const { data: tagsData } = await customSupabase
        .from('blog_tags')
        .select('*')
        .order('name');

      // Fetch post counts for each tag
      const tagsWithCount = await Promise.all((tagsData || []).map(async (tag) => {
        const { count } = await customSupabase
          .from('blog_posts_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        return {
          ...tag,
          count: count || 0
        };
      }));

      setTags(tagsWithCount);
    } catch (error) {
      console.error('Error fetching categories and tags:', error);
    }
  };

  const filterPosts = () => {
    return posts.filter((post) => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !selectedCategory || 
        post.categories.some(cat => cat.slug === selectedCategory);

      const matchesTag = !selectedTag || 
        post.tags.some(tag => tag.slug === selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const filteredPosts = filterPosts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Our Blog</h1>
        <p className="text-lg text-white/70 mb-8">Latest news, updates, and stories</p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Search and filters */}
            <div className="mb-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full mb-4"
                />
              </div>

              {/* Selected filters */}
              {(selectedCategory || selectedTag || searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {searchQuery && (
                    <Badge variant="secondary" className="text-sm py-1">
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="text-sm py-1">
                      Category: {categories.find(c => c.slug === selectedCategory)?.name}
                    </Badge>
                  )}
                  {selectedTag && (
                    <Badge variant="secondary" className="text-sm py-1">
                      Tag: {tags.find(t => t.slug === selectedTag)?.name}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7">
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-white mb-2">No posts found</h3>
                <p className="text-white/70 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="glass overflow-hidden">
                    {post.featured_image && (
                      <div className="w-full h-64 bg-gray-200 overflow-hidden">
                        <img 
                          src={post.featured_image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-white/60">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                        </span>
                        {post.author_name && (
                          <span>By {post.author_name}</span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-white">{post.title}</h2>
                      <p className="text-white/80 mb-4">
                        {post.excerpt || post.content.substring(0, 150) + '...'}
                      </p>
                      
                      {/* Categories and tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((category) => (
                          <Badge 
                            key={category.slug} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => setSelectedCategory(category.slug)}
                          >
                            {category.name}
                          </Badge>
                        ))}
                        
                        {post.tags.map((tag) => (
                          <Badge 
                            key={tag.slug} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => setSelectedTag(tag.slug)}
                          >
                            <Tag className="h-3 w-3 mr-1" /> {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/blog/${post.slug}`}>
                        <Button variant="outline">
                          Read more <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-white">Categories</h3>
              <Separator className="mb-3" />
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Button 
                      variant={selectedCategory === category.slug ? "secondary" : "ghost"} 
                      className="w-full justify-between"
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.slug ? null : category.slug
                      )}
                    >
                      <span>{category.name}</span>
                      <Badge variant="outline">{category.count}</Badge>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Tags */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-white">Tags</h3>
              <Separator className="mb-3" />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.slug} 
                    variant={selectedTag === tag.slug ? "secondary" : "outline"}
                    className="cursor-pointer text-sm py-1"
                    onClick={() => setSelectedTag(
                      selectedTag === tag.slug ? null : tag.slug
                    )}
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
