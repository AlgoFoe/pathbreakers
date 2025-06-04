"use client";

import BlogCard from "@/components/blogs/BlogCard";
import BlogDialog from "@/components/blogs/BlogDialog";
import BlogFilterBar from "@/components/blogs/BlogFilterBar";
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
// import SeedBlogsButton from '@/components/blogs/SeedButton';
import SeedBlogsButton from "@/components/blogs/SeedButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import useDebounce from "@/hooks/useDebounce";
import BlogService, { BlogData } from "@/lib/services/blog.service";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

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

interface BlogsClientProps {
  initialBlogs: BlogType[];
  tags: string[];
}

const BlogsClient: React.FC<BlogsClientProps> = ({ initialBlogs, tags }) => {
  // State
  const [blogs, setBlogs] = useState<BlogType[]>(initialBlogs || []);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogType[]>(
    initialBlogs || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const { toast } = useToast();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Automatically fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Pass published=true for non-admin users to ensure they only see published blogs
        const result = await BlogService.getBlogs({
          published: isAdmin ? undefined : true
        });
        
        if (result && result.data) {
          setBlogs(result.data);
          setFilteredBlogs(result.data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast({
          title: "Error",
          description: "Failed to load blogs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [isAdmin, toast]); // Only re-run if admin status changes

  // Filter blogs based on search and tag selection
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        if ((selectedTag && selectedTag !== "all") || debouncedSearchTerm) {
          const result = await BlogService.getBlogs({
            tag: selectedTag !== "all" ? selectedTag : undefined,
            query: debouncedSearchTerm || undefined,
            published: isAdmin ? undefined : true // Ensure non-admin users only see published blogs
          });
          setFilteredBlogs(result.data || []);
        } else {
          // If no filters, show all blogs (but ensure non-admins only see published blogs)
          setFilteredBlogs(blogs);
        }
      } catch (error) {
        console.error("Error filtering blogs:", error);
        toast({
          title: "Error",
          description: "Failed to filter blogs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [debouncedSearchTerm, selectedTag, refreshTrigger, blogs, toast, isAdmin]);  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Ensure non-admin users only see published blogs
      const result = await BlogService.getBlogs({
        published: isAdmin ? undefined : true
      });
      
      setBlogs(result.data || []);
      setFilteredBlogs(result.data || []);
      setRefreshTrigger((prev) => prev + 1);

      toast({
        title: "Success",
        description: "Blogs refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    const blog = blogs.find((blog) => blog._id === id);
    if (blog) {
      setEditingBlog({
        id: blog._id,
        title: blog.title,
        summary: blog.summary,
        content: blog.content,
        coverImage: blog.coverImage,
        tags: blog.tags,
        slug: blog.slug,
        published: blog.published,
      });
      setIsDialogOpen(true);
    }
  };
  const handleSaveBlog = async (data: BlogData) => {
    try {
      if (editingBlog?.id) {
        const updatedBlog = await BlogService.updateBlog(editingBlog.id, data);
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === editingBlog.id ? { ...blog, ...updatedBlog } : blog
          )
        );
      } else {
        const newBlog = await BlogService.createBlog(data);
        setBlogs((prev) => [newBlog, ...prev]);
      }

      // Trigger a refresh of filtered blogs
      setRefreshTrigger((prev) => prev + 1);

      return Promise.resolve();
    } catch (error) {
      console.error("Error saving blog:", error);
      return Promise.reject(error);
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
        />        {isAdmin && (
          <div className="self-end sm:self-auto">
            <SeedBlogsButton />
          </div>
        )}
      </div>{" "}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {/* Only show published blogs to non-admin users (double safety) */}
            {filteredBlogs
              .filter(blog => isAdmin || blog.published)
              .map((blog) => (
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
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 px-6">
          <Alert>
            <AlertDescription className="text-center">
              {initialBlogs.length === 0
                ? "No blogs found. Create a new one."
                : "No blogs match your current filters. Try adjusting your search criteria."}
            </AlertDescription>
          </Alert>
        </Card>
      )}
      <BlogDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveBlog}
        initialData={
          editingBlog
            ? { ...editingBlog, tags: editingBlog.tags ?? [] }
            : undefined
        }
        isEditing={!!editingBlog}
      />
    </div>
  );
};

export default BlogsClient;
