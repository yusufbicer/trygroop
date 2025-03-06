
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { 
  Book, 
  Search, 
  MoreHorizontal, 
  PenLine, 
  Trash2, 
  Plus, 
  Eye, 
  FileEdit, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Tag,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  featured_image: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [postCategories, setPostCategories] = useState<string[]>([]);
  const [postTags, setPostTags] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [newTag, setNewTag] = useState({ name: '', slug: '' });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // For rich text editor - in a real app, you would use a proper rich text editor
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch blog posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchPostCategoriesAndTags = async (postId: string) => {
    try {
      // Fetch categories for the post
      const { data: categoriesData } = await supabase
        .from('blog_posts_categories')
        .select('category_id')
        .eq('post_id', postId);

      setPostCategories((categoriesData || []).map(item => item.category_id));

      // Fetch tags for the post
      const { data: tagsData } = await supabase
        .from('blog_posts_tags')
        .select('tag_id')
        .eq('post_id', postId);

      setPostTags((tagsData || []).map(item => item.tag_id));
    } catch (error: any) {
      console.error('Error fetching post categories and tags:', error);
    }
  };

  const handleCreateOrUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPost) return;
    
    try {
      const isNewPost = !editingPost.id;
      const now = new Date().toISOString();
      
      // Prepare post data
      const postData = {
        ...editingPost,
        slug: editingPost.slug.trim() === '' 
          ? editingPost.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          : editingPost.slug,
        author_id: user?.id,
        updated_at: now,
        published_at: editingPost.published ? (editingPost.published_at || now) : null
      };
      
      let result;
      
      if (isNewPost) {
        // Create new post
        result = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            created_at: now
          })
          .select()
          .single();
        
        if (result.error) throw result.error;
        
        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        });
      } else {
        // Update existing post
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
          .select()
          .single();
        
        if (result.error) throw result.error;
        
        // First delete all existing category and tag relationships
        await supabase
          .from('blog_posts_categories')
          .delete()
          .eq('post_id', editingPost.id);
          
        await supabase
          .from('blog_posts_tags')
          .delete()
          .eq('post_id', editingPost.id);
          
        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        });
      }
      
      const postId = result.data.id;
      
      // Add categories
      if (postCategories.length > 0) {
        const categoryRelations = postCategories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));
        
        const { error: categoriesError } = await supabase
          .from('blog_posts_categories')
          .insert(categoryRelations);
          
        if (categoriesError) throw categoriesError;
      }
      
      // Add tags
      if (postTags.length > 0) {
        const tagRelations = postTags.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        }));
        
        const { error: tagsError } = await supabase
          .from('blog_posts_tags')
          .insert(tagRelations);
          
        if (tagsError) throw tagsError;
      }
      
      // Refresh the posts list
      fetchPosts();
      closeEditor();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      // First delete category and tag relationships
      await supabase
        .from('blog_posts_categories')
        .delete()
        .eq('post_id', postToDelete);
        
      await supabase
        .from('blog_posts_tags')
        .delete()
        .eq('post_id', postToDelete);
      
      // Then delete the post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      });
      
      // Refresh the posts list
      fetchPosts();
      setDeleteConfirmOpen(false);
      setPostToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  };

  const handleCreateCategory = async () => {
    if (newCategory.name.trim() === '') return;
    
    try {
      const slug = newCategory.slug.trim() === '' 
        ? newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : newCategory.slug;
        
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: newCategory.name,
          slug: slug
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      
      // Refresh categories and clear form
      fetchCategories();
      setNewCategory({ name: '', slug: '' });
      setIsCategoryDialogOpen(false);
      
      // Add the new category to the current post
      if (editingPost && data) {
        setPostCategories([...postCategories, data.id]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTag = async () => {
    if (newTag.name.trim() === '') return;
    
    try {
      const slug = newTag.slug.trim() === '' 
        ? newTag.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : newTag.slug;
        
      const { data, error } = await supabase
        .from('blog_tags')
        .insert({
          name: newTag.name,
          slug: slug
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Tag created successfully',
      });
      
      // Refresh tags and clear form
      fetchTags();
      setNewTag({ name: '', slug: '' });
      setIsTagDialogOpen(false);
      
      // Add the new tag to the current post
      if (editingPost && data) {
        setPostTags([...postTags, data.id]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tag',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = () => {
    if (selectedCategory && !postCategories.includes(selectedCategory)) {
      setPostCategories([...postCategories, selectedCategory]);
      setSelectedCategory('');
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setPostCategories(postCategories.filter(id => id !== categoryId));
  };

  const handleAddTag = () => {
    if (selectedTag && !postTags.includes(selectedTag)) {
      setPostTags([...postTags, selectedTag]);
      setSelectedTag('');
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setPostTags(postTags.filter(id => id !== tagId));
  };

  const createNewPost = () => {
    setEditingPost({
      id: '',
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      published: false,
      featured_image: null,
      author_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null
    });
    setPostCategories([]);
    setPostTags([]);
    setIsEditorOpen(true);
  };

  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    fetchPostCategoriesAndTags(post.id);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingPost(null);
    setIsEditorOpen(false);
    setPostCategories([]);
    setPostTags([]);
  };

  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setDeleteConfirmOpen(true);
  };

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      const now = new Date().toISOString();
      const updates = {
        published: !post.published,
        published_at: !post.published ? (post.published_at || now) : null,
        updated_at: now
      };
      
      const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Blog post ${!post.published ? 'published' : 'unpublished'} successfully`,
      });
      
      // Refresh the posts list
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update blog post',
        variant: 'destructive',
      });
    }
  };

  const handleViewPost = (slug: string) => {
    // Open in a new tab
    window.open(`/blog/${slug}`, '_blank');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPublishedFilter = filterPublished === null || post.published === filterPublished;
    
    return matchesSearch && matchesPublishedFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Blog Management</h1>
          <p className="text-white/70">Create and manage blog content</p>
        </div>
        <Button className="mt-4 sm:mt-0" onClick={createNewPost}>
          <PenLine className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search blog posts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={filterPublished === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterPublished(null)}
          >
            All
          </Button>
          <Button 
            variant={filterPublished === true ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterPublished(true)}
          >
            <CheckCircle className="mr-1 h-4 w-4" /> Published
          </Button>
          <Button 
            variant={filterPublished === false ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterPublished(false)}
          >
            <XCircle className="mr-1 h-4 w-4" /> Drafts
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-10 text-center">
            <Book className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No blog posts found</h3>
            <p className="text-white/70 mb-4">
              {searchTerm ? "No posts match your search criteria" : "Create your first blog post"}
            </p>
            <Button onClick={createNewPost}>
              <PenLine className="mr-2 h-4 w-4" /> Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">All Blog Posts</CardTitle>
            <CardDescription>Total: {filteredPosts.length} posts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium w-1/3">{post.title}</TableCell>
                    <TableCell>
                      {post.published ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <CheckCircle className="mr-1 h-3 w-3" /> Published
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                          <XCircle className="mr-1 h-3 w-3" /> Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell>{formatDate(post.published_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => editPost(post)}>
                            <FileEdit className="mr-2 h-4 w-4 text-blue-500" />
                            Edit
                          </DropdownMenuItem>
                          {post.published && (
                            <DropdownMenuItem onClick={() => handleViewPost(post.slug)}>
                              <Eye className="mr-2 h-4 w-4 text-green-500" />
                              View
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleTogglePublished(post)}>
                            {post.published ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDeletePost(post.id)}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Post Editor Dialog */}
      {isEditorOpen && editingPost && (
        <Dialog open={isEditorOpen} onOpenChange={closeEditor}>
          <DialogContent className="bg-groop-dark text-white max-w-4xl">
            <DialogHeader>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4"
                onClick={closeEditor}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <DialogTitle className="text-xl mt-6">
                {editingPost.id ? 'Edit Blog Post' : 'Create Blog Post'}
              </DialogTitle>
              <DialogDescription>
                {editingPost.id ? 'Make changes to your blog post' : 'Create a new blog post'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateOrUpdatePost} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="categories">Categories & Tags</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Input
                      placeholder="Post Title"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      className="text-xl font-bold"
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Excerpt (optional)"
                      value={editingPost.excerpt || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Textarea
                      ref={contentRef}
                      placeholder="Post content (HTML supported)"
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="min-h-[400px] font-mono"
                      required
                    />
                  </div>
                </TabsContent>

                {/* Categories & Tags Tab */}
                <TabsContent value="categories" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categories Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Categories</h3>
                      <div className="flex space-x-2">
                        <select
                          className="bg-background text-white rounded-md border border-input p-2 w-full"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="">Select category...</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <Button type="button" onClick={handleAddCategory} size="sm">
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">
                          {postCategories.length} categories selected
                        </span>
                        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" /> New Category
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Category</DialogTitle>
                              <DialogDescription>
                                Add a new category to organize your blog posts
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label htmlFor="categoryName">Category Name</label>
                                <Input
                                  id="categoryName"
                                  value={newCategory.name}
                                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                  placeholder="e.g. Technology"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="categorySlug">Slug (optional)</label>
                                <Input
                                  id="categorySlug"
                                  value={newCategory.slug}
                                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                  placeholder="e.g. technology"
                                />
                                <p className="text-sm text-white/50">
                                  If left empty, will be generated from name
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateCategory}>
                                Create
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {postCategories.map((categoryId) => {
                          const category = categories.find(c => c.id === categoryId);
                          return category ? (
                            <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
                              {category.name}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => handleRemoveCategory(category.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tags</h3>
                      <div className="flex space-x-2">
                        <select
                          className="bg-background text-white rounded-md border border-input p-2 w-full"
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                        >
                          <option value="">Select tag...</option>
                          {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                        </select>
                        <Button type="button" onClick={handleAddTag} size="sm">
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">
                          {postTags.length} tags selected
                        </span>
                        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" /> New Tag
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Tag</DialogTitle>
                              <DialogDescription>
                                Add a new tag to categorize your blog posts
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label htmlFor="tagName">Tag Name</label>
                                <Input
                                  id="tagName"
                                  value={newTag.name}
                                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                  placeholder="e.g. JavaScript"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="tagSlug">Slug (optional)</label>
                                <Input
                                  id="tagSlug"
                                  value={newTag.slug}
                                  onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                                  placeholder="e.g. javascript"
                                />
                                <p className="text-sm text-white/50">
                                  If left empty, will be generated from name
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateTag}>
                                Create
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {postTags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.name}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => handleRemoveTag(tag.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="postSlug">URL Slug</label>
                    <Input
                      id="postSlug"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      placeholder="post-url-slug"
                    />
                    <p className="text-sm text-white/50">
                      If left empty, will be generated from title
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="featuredImage">Featured Image URL</label>
                    <Input
                      id="featuredImage"
                      value={editingPost.featured_image || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2 flex items-center">
                    <label htmlFor="publishedStatus" className="mr-2">Published</label>
                    <input
                      id="publishedStatus"
                      type="checkbox"
                      checked={editingPost.published}
                      onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={closeEditor} type="button">
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPost.id ? 'Update Post' : 'Create Post'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
