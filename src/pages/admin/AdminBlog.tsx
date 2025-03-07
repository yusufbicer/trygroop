import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBlog } from '@/hooks/useBlog';
import { BlogPost, Category, Tag } from '@/types/blog';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Tag as TagIcon, 
  FolderPlus, 
  Calendar,
  User,
  MoreVertical,
  FileText,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminBlog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { 
    allPosts, 
    categories, 
    tags, 
    isLoading, 
    createPost,
    updatePost,
    deletePost,
    createCategory,
    createTag
  } = useAdminBlog();

  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    published: false,
    selectedCategories: [] as string[],
    selectedTags: [] as string[]
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [tagForm, setTagForm] = useState({ name: '', slug: '' });

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.published) ||
      (statusFilter === 'draft' && !post.published);

    return matchesSearch && matchesStatus;
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      published: false,
      selectedCategories: [],
      selectedTags: []
    });
    setCurrentPostId(null);
  };

  const handleNewPost = () => {
    resetPostForm();
    setIsPostModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image: post.featured_image || '',
      published: post.published,
      selectedCategories: post.categories.map(c => c.id),
      selectedTags: post.tags.map(t => t.id)
    });
    setCurrentPostId(post.id);
    setIsPostModalOpen(true);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!postForm.title || !postForm.content) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const slug = postForm.slug || generateSlug(postForm.title);

      if (currentPostId) {
        await updatePost.mutateAsync({
          id: currentPostId,
          post: {
            title: postForm.title,
            slug,
            content: postForm.content,
            excerpt: postForm.excerpt || null,
            featured_image: postForm.featured_image || null,
            published: postForm.published,
            author_id: user.id
          },
          categoryIds: postForm.selectedCategories,
          tagIds: postForm.selectedTags
        });
      } else {
        await createPost.mutateAsync({
          post: {
            title: postForm.title,
            slug,
            content: postForm.content,
            excerpt: postForm.excerpt || null,
            featured_image: postForm.featured_image || null,
            published: postForm.published,
            author_id: user.id,
            published_at: postForm.published ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          categoryIds: postForm.selectedCategories,
          tagIds: postForm.selectedTags
        });
      }

      resetPostForm();
      setIsPostModalOpen(false);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const slug = categoryForm.slug || generateSlug(categoryForm.name);

      await createCategory.mutateAsync({
        name: categoryForm.name,
        slug
      });

      setCategoryForm({ name: '', slug: '' });
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagForm.name) {
      toast({
        title: 'Error',
        description: 'Tag name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const slug = tagForm.slug || generateSlug(tagForm.name);

      await createTag.mutateAsync({
        name: tagForm.name,
        slug
      });

      setTagForm({ name: '', slug: '' });
      setIsTagModalOpen(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await deletePost.mutateAsync(postToDelete);
      setPostToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
        <Button onClick={handleNewPost}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search posts..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as 'all' | 'published' | 'draft')}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' ? 
                    "No posts match your search criteria" : 
                    "You haven't created any blog posts yet"}
                </p>
                <Button onClick={handleNewPost}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.created_at)}</span>
                          {post.author_name && (
                            <>
                              <span>•</span>
                              <User className="h-4 w-4" />
                              <span>{post.author_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant={post.published ? "default" : "outline"} className="ml-2">
                        {post.published ? (
                          <Eye className="h-3 w-3 mr-1" />
                        ) : (
                          <EyeOff className="h-3 w-3 mr-1" />
                        )}
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <Badge key={category.id || category.slug} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                      {post.tags.map((tag) => (
                        <Badge key={tag.id || tag.slug} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      View
                    </Button>
                    <div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="mr-2"
                        onClick={() => handleEditPost(post)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => confirmDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Categories</h2>
            <Button onClick={() => setIsCategoryModalOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FolderPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No categories found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't created any categories yet
                </p>
                <Button onClick={() => setIsCategoryModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id || category.slug}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      Slug: {category.slug}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Tags</h2>
            <Button onClick={() => setIsTagModalOpen(true)}>
              <TagIcon className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : tags.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <TagIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tags found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't created any tags yet
                </p>
                <Button onClick={() => setIsTagModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id || tag.slug} className="text-base py-2 px-4">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentPostId ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
            <DialogDescription>
              Fill out the form below to {currentPostId ? 'update' : 'create'} your blog post.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={postForm.title}
                onChange={(e) => {
                  setPostForm({
                    ...postForm,
                    title: e.target.value,
                    slug: !postForm.slug ? generateSlug(e.target.value) : postForm.slug
                  });
                }}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={postForm.slug}
                onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                placeholder="enter-post-slug"
              />
              <p className="text-sm text-gray-500">
                Leave empty to generate from title
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={postForm.excerpt}
                onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                placeholder="Brief summary of the post"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                placeholder="Write your post content"
                rows={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={postForm.featured_image}
                onChange={(e) => setPostForm({ ...postForm, featured_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category.id || category.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id || category.slug}`}
                      checked={postForm.selectedCategories.includes(category.id || category.slug)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPostForm({
                            ...postForm,
                            selectedCategories: [...postForm.selectedCategories, category.id || category.slug]
                          });
                        } else {
                          setPostForm({
                            ...postForm,
                            selectedCategories: postForm.selectedCategories.filter(id => id !== (category.id || category.slug))
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category.id || category.slug}`} className="cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <div key={tag.id || tag.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id || tag.slug}`}
                      checked={postForm.selectedTags.includes(tag.id || tag.slug)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPostForm({
                            ...postForm,
                            selectedTags: [...postForm.selectedTags, tag.id || tag.slug]
                          });
                        } else {
                          setPostForm({
                            ...postForm,
                            selectedTags: postForm.selectedTags.filter(id => id !== (tag.id || tag.slug))
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`tag-${tag.id || tag.slug}`} className="cursor-pointer">
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={postForm.published}
                onCheckedChange={(checked) => 
                  setPostForm({ ...postForm, published: !!checked })
                }
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetPostForm();
                  setIsPostModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentPostId ? 'Update' : 'Create'} Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing your blog posts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => {
                  setCategoryForm({
                    ...categoryForm,
                    name: e.target.value,
                    slug: !categoryForm.slug ? generateSlug(e.target.value) : categoryForm.slug
                  });
                }}
                placeholder="Category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="category-slug"
              />
              <p className="text-sm text-gray-500">
                Leave empty to generate from name
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCategoryForm({ name: '', slug: '' });
                  setIsCategoryModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag for organizing your blog posts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTagSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name *</Label>
              <Input
                id="tag-name"
                value={tagForm.name}
                onChange={(e) => {
                  setTagForm({
                    ...tagForm,
                    name: e.target.value,
                    slug: !tagForm.slug ? generateSlug(e.target.value) : tagForm.slug
                  });
                }}
                placeholder="Tag name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                value={tagForm.slug}
                onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
                placeholder="tag-slug"
              />
              <p className="text-sm text-gray-500">
                Leave empty to generate from name
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setTagForm({ name: '', slug: '' });
                  setIsTagModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Tag</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPostToDelete(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePost}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
