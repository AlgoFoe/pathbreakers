"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { BlogData } from "@/lib/services/blog.service";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  PlusCircle,
  Search,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BlogsAdmin() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState<string | null>(null);
    // Load blogs from API
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/blogs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-no-auth': 'true'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setBlogs(data.data || []);
      } catch (error) {
        console.error("Failed to load blogs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load blog posts. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBlogs();
  }, []);
    const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      setIsStatusChanging(id);
      
      const response = await fetch(`/api/blogs/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-no-auth': 'true'
        },
        body: JSON.stringify({ published: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update local state
      setBlogs(blogs.map(blog => 
        blog._id === id || blog.id === id 
          ? { ...blog, published: !currentStatus } 
          : blog
      ));
      
      toast({
        title: `Blog ${!currentStatus ? "published" : "unpublished"}`,
        description: `The blog has been ${!currentStatus ? "published" : "unpublished"} successfully.`,
      });
    } catch (error) {
      console.error("Failed to update blog status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update blog status. Please try again.",
      });
    } finally {
      setIsStatusChanging(null);
    }
  };
    const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      try {
        setIsDeleting(id);
        
        const response = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-no-auth': 'true'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remove from local state
        setBlogs(blogs.filter(blog => blog._id !== id && blog.id !== id));
        
        toast({
          title: "Blog deleted",
          description: "The blog has been deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete blog:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the blog. Please try again.",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && blog.published) || 
      (statusFilter === "draft" && !blog.published);
    const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Extract unique categories from blogs
  const categories = Array.from(new Set(blogs.map(blog => blog.category).filter(Boolean) as string[]));

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold"
        >
          Blog Management
        </motion.h1>
        
        <Button asChild>
          <Link href="/admin/blogs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Blog
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-1 max-w-sm items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          <p className="text-muted-foreground">Loading blogs...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredBlogs.length > 0 ? (
                    filteredBlogs.map((blog) => (
                      <TableRow key={blog._id || blog.id}>
                        <TableCell className="font-medium">{blog.title}</TableCell>
                        <TableCell>{blog.category || 'Uncategorized'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {blog.published ? (
                              <>
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span>Draft</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(blog.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/blogs/${blog._id || blog.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild disabled={!blog.published}>
                              <Link 
                                href={blog.published ? `/dashboard/blogs/${blog.slug || blog._id || blog.id}` : '#'} 
                                target="_blank"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handlePublishToggle(blog._id || blog.id as string, !!blog.published)}
                                  disabled={isStatusChanging === (blog._id || blog.id)}
                                >
                                  {isStatusChanging === (blog._id || blog.id) ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : blog.published ? (
                                    <>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Publish
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(blog._id || blog.id as string)}
                                  disabled={isDeleting === (blog._id || blog.id)}
                                >
                                  {isDeleting === (blog._id || blog.id) ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No blogs found matching your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
