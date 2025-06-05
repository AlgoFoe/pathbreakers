"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "@/hooks/useDebounce";
import BlogCard from "@/components/blogs/BlogCard";
import BlogDialog from "@/components/blogs/BlogDialog";
import BlogFilterBar from "@/components/blogs/BlogFilterBar";
import SeedBlogsButton from "@/components/blogs/SeedButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface BlogType {
  _id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  slug: string;
  authorId: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogFormData {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  tags?: string[];
  published?: boolean;
  slug?: string;
}

interface BlogsClientProps {
  initialBlogs: BlogType[];
  tags: string[];
}

const BlogsDirect: React.FC<BlogsClientProps> = ({ initialBlogs, tags }) => {
  const { toast } = useToast();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  // State
  const [blogs, setBlogs] = useState<BlogType[]>(initialBlogs || []);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogType[]>(initialBlogs || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogType | null>(null);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch blogs whenever filters change
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        if (selectedTag !== 'all') {
          params.append('tag', selectedTag);
        }
        if (debouncedSearchQuery) {
          params.append('query', debouncedSearchQuery);
        }
        if (!isAdmin) {
          params.append('published', 'true');
        }

        // Make API call
        const url = `/api/blogs${params.toString() ? `?${params.toString()}` : ''}`;
        console.log("Fetching blogs from:", url);
        
        const response = await fetch(url, {
          headers: {
            'x-no-auth': 'true' // Signal that this request should bypass auth
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setBlogs(result.data);
          setFilteredBlogs(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch blogs');
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast({
          title: "Error",
          description: "Failed to load blogs. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [debouncedSearchQuery, selectedTag, isAdmin, toast]);

  // Handle creating a new blog
  const handleCreateBlog = async (data: BlogFormData) => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-no-auth': 'true'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }

      const result = await response.json();
      
      // Add the new blog to state
      setBlogs(prev => [result.data, ...prev]);
      setFilteredBlogs(prev => [result.data, ...prev]);
      
      toast({
        title: "Success",
        description: "Blog created successfully",
      });
      
      // Close the dialog
      setIsDialogOpen(false);
      
      return result.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      toast({
        title: "Error",
        description: "Failed to create blog. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle updating a blog
  const handleUpdateBlog = async (id: string, data: BlogFormData) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-no-auth': 'true'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blog');
      }

      const result = await response.json();
      
      // Update the blog in state
      setBlogs(prev => 
        prev.map(blog => 
          blog._id === id ? result.data : blog
        )
      );
      setFilteredBlogs(prev => 
        prev.map(blog => 
          blog._id === id ? result.data : blog
        )
      );
      
      toast({
        title: "Success",
        description: "Blog updated successfully",
      });

      // Close the dialog
      setIsDialogOpen(false);
      setEditingBlog(null);
      
      return result.data;
    } catch (error) {
      console.error("Error updating blog:", error);
      toast({
        title: "Error",
        description: "Failed to update blog. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle deleting a blog
  const handleDeleteBlog = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'x-no-auth': 'true'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete blog');
      }

      await response.json();
      
      // Remove the blog from state
      setBlogs(prev => prev.filter(blog => blog._id !== id));
      setFilteredBlogs(prev => prev.filter(blog => blog._id !== id));
      
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSaveBlog = async (data: BlogFormData) => {
    if (editingBlog) {
      return handleUpdateBlog(editingBlog._id, data);
    } else {
      return handleCreateBlog(data);
    }
  };

  // Reset filters to trigger a refresh
  const handleRefresh = () => {
    setSelectedTag('all');
    setSearchQuery('');
  };

  // Open dialog for creating a new blog
  const handleCreateNew = () => {
    setEditingBlog(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing a blog
  const handleEditBlog = (id: string) => {
    const blog = blogs.find(blog => blog._id === id);
    if (blog) {
      setEditingBlog(blog);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <BlogFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onCreateNew={handleCreateNew}
          tags={tags}
          onRefresh={handleRefresh}
        />
        
        {isAdmin && (
          <div className="self-end sm:self-auto">
            <SeedBlogsButton />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading blogs...</span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <Alert>
          <AlertDescription>
            No blogs found. Try adjusting your filters or create a new blog.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBlogs.map((blog) => (
              <motion.div
                key={blog._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <BlogCard
                  id={blog._id}
                  slug={blog.slug}
                  title={blog.title}
                  summary={blog.summary}
                  coverImage={blog.coverImage}
                  tags={blog.tags}
                  authorId={blog.authorId}
                  createdAt={blog.createdAt}
                //   onEdit={isAdmin ? () => handleEditBlog(blog._id) : undefined}
                //   onDelete={isAdmin ? () => handleDeleteBlog(blog._id) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <BlogDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingBlog(null);
        }}
        onSave={handleSaveBlog}
        initialData={editingBlog ? {
          title: editingBlog.title,
          summary: editingBlog.summary,
          content: editingBlog.content,
          coverImage: editingBlog.coverImage,
          tags: editingBlog.tags || [],
          published: editingBlog.published,
          slug: editingBlog.slug,
        } : undefined}
        isEditing={!!editingBlog}
      />
    </div>
  );
};

export default BlogsDirect;
