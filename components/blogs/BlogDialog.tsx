"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface BlogFormData {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  slug?: string;
  published?: boolean;
}

interface BlogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BlogFormData) => Promise<void>;
  initialData?: BlogFormData;
  isEditing?: boolean;
}

const BlogDialog: React.FC<BlogDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTagsInput(initialData.tags?.join(', ') || '');
    } else {
      setFormData({
        title: '',
        summary: '',
        content: '',
        coverImage: '',
        tags: [],
      });
      setTagsInput('');
    }
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.summary.trim()) newErrors.summary = "Summary is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.coverImage.trim()) newErrors.coverImage = "Cover image URL is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BlogFormData, value: string) => {
    if (field === 'tags') {
      setTagsInput(value);
      // Convert comma-separated string to array
      const tagsArray = value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      setFormData(prev => ({ ...prev, tags: tagsArray }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error for this field if it exists
    if (errors[field]) {
      const { [field]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Generate slug if not provided
    if (!formData.slug && !isEditing) {
      formData.slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      
      toast({
        title: `Blog ${isEditing ? 'updated' : 'created'} successfully!`,
        variant: "default",
      });
      
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} blog`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      tags: [],
    });
    setTagsInput('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter blog title..."
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                placeholder="Enter a brief summary..."
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                className={errors.summary ? "border-red-500" : ""}
                rows={2}
              />
              {errors.summary && <p className="text-red-500 text-xs">{errors.summary}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content (HTML)</Label>
              <Textarea
                id="content"
                placeholder="Enter blog content in HTML format..."
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className={errors.content ? "border-red-500" : ""}
                rows={10}
              />
              {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                placeholder="Enter cover image URL..."
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                className={errors.coverImage ? "border-red-500" : ""}
              />
              {errors.coverImage && <p className="text-red-500 text-xs">{errors.coverImage}</p>}
              {formData.coverImage && (
                <div className="mt-2 relative h-40 rounded-md overflow-hidden">
                  <img 
                    src={formData.coverImage} 
                    alt="Cover preview" 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas..."
                value={tagsInput}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md">
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug (optional)</Label>
                <Input
                  id="slug"
                  placeholder="custom-url-slug"
                  value={formData.slug || ''}
                  onChange={(e) => handleChange('slug', e.target.value)}
                />
                <p className="text-xs text-gray-500">Leave empty to generate from title</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? `${isEditing ? "Updating..." : "Creating..."}`
                : `${isEditing ? "Update" : "Create"} Blog`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogDialog;
