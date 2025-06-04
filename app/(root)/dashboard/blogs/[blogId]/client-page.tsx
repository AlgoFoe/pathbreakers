"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, User2, ArrowLeft, Edit, Trash2, Clock, Eye } from 'lucide-react';
import BlogService from '@/lib/services/blog.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@clerk/nextjs';

const BlogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();  
  const { user, isSignedIn } = useUser();
  
  // Changed from slug to blogId
  const blogId = params.blogId as string;
  
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  
  // Check if user is admin (for edit/delete permissions)
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {        
        setIsLoading(true);
        const blogData = await BlogService.getBlogByIdOrSlug(blogId);
        
        // If the blog is not published and user is not an admin, redirect to blogs page
        if (!blogData.published && user?.publicMetadata?.role !== 'admin') {
          toast({
            title: 'Access denied',
            description: 'This blog is not published yet.',
            variant: 'destructive',
          });
          router.push('/dashboard/blogs');
          return;
        }
        
        setBlog(blogData);
      } catch (error) {
        console.error('Error fetching blog:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog',
          variant: 'destructive',
        });
        router.push('/dashboard/blogs');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (blogId) {
      fetchBlog();
    }
  }, [blogId, router, toast, user?.publicMetadata?.role]);

  const handleDelete = async () => {
    if (!blog?._id) return;
    
    setIsDeleting(true);
    try {
      await BlogService.deleteBlog(blog._id);
      toast({
        title: 'Blog deleted',
        description: 'The blog has been deleted successfully',
      });
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!blog?._id) return;
    
    setIsStatusChanging(true);
    try {
      await BlogService.updateBlogStatus(blog._id, !blog.published);
      
      // Update local state
      setBlog({
        ...blog,
        published: !blog.published
      });
      
      toast({
        title: blog.published ? 'Blog unpublished' : 'Blog published',
        description: `The blog is now ${blog.published ? 'unpublished' : 'published'}`,
      });
    } catch (error) {
      console.error('Error toggling blog status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog status',
        variant: 'destructive',
      });
    } finally {
      setIsStatusChanging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard/blogs')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
      </div>

      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
          {blog.coverImage && (
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              priority
              className="object-cover"
            />
          )}
        </div>

        {/* Blog Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {blog.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold">{blog.title}</h1>

          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center">
              <User2 className="h-4 w-4 mr-1" />
              <span>Admin</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {blog.published ? (
              <div className="flex items-center text-green-600">
                <Eye className="h-4 w-4 mr-1" />
                <span>Published</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>Draft</span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/admin/blogs/${blog._id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                
                <Button 
                  variant={blog.published ? "destructive" : "default"}
                  onClick={handleTogglePublish}
                  disabled={isStatusChanging}
                >
                  {isStatusChanging ? (
                    <>Loading...</>
                  ) : (
                    <>
                      {blog.published ? (
                        <>Unpublish</>
                      ) : (
                        <>Publish</>
                      )}
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog Summary */}
        <Card>
          <CardContent className="p-6 italic text-muted-foreground">
            {blog.summary}
          </CardContent>
        </Card>
        
        {/* Blog Content */}
        <Card>
          <CardContent className="p-6 prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this blog post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogDetailPage;
