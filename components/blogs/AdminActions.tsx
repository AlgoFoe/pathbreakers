"use client";

import { useRouter } from "next/navigation";
import BlogService from "@/lib/services/blog.service";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface AdminActionsProps {
  blogId: string;
  isPublished: boolean;
}

const AdminActions = ({ blogId, isPublished }: AdminActionsProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handlePublishToggle = async () => {
    try {
      setIsUpdating(true);
      await BlogService.updateBlogStatus(blogId, !isPublished);
      
      toast({
        title: `Blog ${!isPublished ? 'published' : 'unpublished'}`,
        description: `The blog has been ${!isPublished ? 'published' : 'unpublished'} successfully.`,
      });
      
      router.refresh(); // Refresh the current page to update the status
    } catch (error) {
      console.error("Error toggling blog status:", error);
      toast({
        title: "Error",
        description: "Failed to update blog status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-3 mb-4">
      <Button
        variant="outline"
        onClick={() => router.push(`/admin/blogs/${blogId}`)}
      >
        Edit Blog
      </Button>
      <Button
        variant="outline"
        disabled={isUpdating}
        onClick={handlePublishToggle}
        className={isPublished ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}
      >
        {isUpdating ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish'}
      </Button>
    </div>
  );
};

export default AdminActions;
