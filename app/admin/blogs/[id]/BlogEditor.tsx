"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import BlogService, { BlogData } from "@/lib/services/blog.service";
import { motion } from "framer-motion";
import {
    ChevronLeft, Eye, EyeOff, Image as ImageIcon,
    Loader2,
    Save
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import BlogPreview from "../components/BlogPreview";
import WordCounter from "../components/WordCounter";
import EditorShortcuts from "../components/EditorShortcuts";

// React Quill import
import dynamic from "next/dynamic";

// Import React Quill dynamically with client-side only - use simpler configuration to avoid issues
const ReactQuill = dynamic(
  () => {
    // We need to import the module without using await to avoid ESM issues
    return import("react-quill").then((mod) => {
      return mod.default;
    });
  },
  {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center bg-gray-50">Loading editor...</div>,
  }
);

// Import Quill CSS
import "react-quill/dist/quill.snow.css";
// Import custom Quill styles
import "../quill-editor.css";

export default function BlogEditor({ params }: { params?: { id: string } }) {
  const router = useRouter();
  const isEditing = !!params?.id;
    // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [featuredPost, setFeaturedPost] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [publishDate, setPublishDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState(false);  // Image upload handler for Quill
  const imageHandler = useCallback(() => {
    // Create a custom file input
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          // Show loading toast
          toast({
            title: "Uploading image...",
            description: (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Please wait while your image is being uploaded</span>
              </div>
            ),
            duration: 10000
          });
            // Upload image
          const formData = new FormData();
          formData.append('image', file);
          
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            headers: {
              'x-no-auth': 'true'
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
          }
          
          const uploadData = await uploadResponse.json();
          const imageUrl = uploadData.url;
          
          // Safer way to insert image into content
          // Without manipulating the Quill instance directly
          setContent(prevContent => {
            return prevContent + `<p><img src="${imageUrl}" alt="Blog image" /></p>`;
          });
          
          // Show success toast
          toast({
            title: "Image uploaded successfully",
            description: "The image has been added to your content",
            variant: "default",
          });
          
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: "Failed to upload image. Please check your connection and try again."
          });
        }
      }
    };
  }, []);  // Quill modules configuration - simplified to prevent delta errors
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ],
      handlers: {
        'image': imageHandler
      }
    },
    clipboard: { matchVisual: false },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };
    const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'script',
    'align',
    'link', 'image',
    'blockquote', 'code-block',
    'color', 'background'
  ];
  // Load blog data if editing
  useEffect(() => {
    const loadBlog = async () => {
      if (isEditing && params?.id) {
        try {
          setIsLoading(true);
          
          const response = await fetch(`/api/blogs/${params.id}`, {
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
          const blog = data.data;
          
          if (blog) {
            setTitle(blog.title || "");
            setSummary(blog.summary || "");
            setContent(blog.content || "");
            setCategory(blog.category || "");
            setCoverImage(blog.coverImage || "");
            setCoverImagePreview(blog.coverImage || "");
            setFeaturedPost(blog.featured || false);
            setTags(blog.tags || []);
            setSlug(blog.slug || "");
            setMetaTitle(blog.metaTitle || blog.title || "");
            setMetaDescription(blog.metaDescription || blog.summary || "");
            setPublishImmediately(!blog.scheduledPublishDate);
            if (blog.scheduledPublishDate) {
              setPublishDate(new Date(blog.scheduledPublishDate).toISOString().slice(0, 16));
            }
          }
        } catch (error) {
          console.error("Error loading blog:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load blog data. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadBlog();
  }, [isEditing, params?.id]);
  
  // Generate slug from title
  useEffect(() => {
    if (!isEditing || !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, isEditing, slug]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Store the file for upload
      setImageFile(file);
    }
  };
  
  const handleTagsInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagsInput.trim();
      
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagsInput("");
      }
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async (isDraft: boolean = false) => {
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!title.trim()) {
        toast({ title: "Error", description: "Blog title is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      if (!summary.trim()) {
        toast({ title: "Error", description: "Blog summary is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      if (!content.trim()) {
        toast({ title: "Error", description: "Blog content is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
        // If we have a new image file, upload it first
      let imageUrl = coverImage;
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            headers: {
              'x-no-auth': 'true'
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
          }
          
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({ 
            title: "Image Upload Failed",
            description: "Failed to upload cover image. Please try again.",
            variant: "destructive" 
          });
          setIsSubmitting(false);
          return;
        }
      }
        // Prepare blog data
      const blogData: BlogData = {
        title,
        summary,
        content,
        coverImage: imageUrl || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80", // Default placeholder
        category,
        tags,
        slug,
        published: !isDraft,
      };
      
      // Add additional metadata if available
      if (metaTitle) blogData.metaTitle = metaTitle;
      if (metaDescription) blogData.metaDescription = metaDescription;
      if (featuredPost) blogData.featured = featuredPost;
      if (!publishImmediately && publishDate) {
        blogData.scheduledPublishDate = new Date(publishDate);
      }
      
      // Create or update blog
      let response;
      if (isEditing && params?.id) {
        response = await fetch(`/api/blogs/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-no-auth': 'true'
          },
          body: JSON.stringify(blogData)
        });
      } else {
        // Generate a slug from the title if not provided
        if (!blogData.slug) {
          blogData.slug = blogData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        // Set author to admin if not provided
        if (!blogData.authorId) {
          blogData.authorId = 'admin';
        }

        response = await fetch('/api/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-no-auth': 'true'
          },
          body: JSON.stringify(blogData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast({
        title: isDraft ? "Draft saved" : "Blog published",
        description: isDraft ? "Your blog draft has been saved" : "Your blog has been published successfully",
      });
      
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error saving blog:", error);
      toast({
        title: "Error",
        description: "Failed to save blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex items-center"
      >
        <Button variant="ghost" onClick={() => router.push("/admin/blogs")} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit Blog" : "Create New Blog"}</h1>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter blog title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>                <div>                  
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">Content</Label>
                      <EditorShortcuts />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center gap-1 text-sm"
                      type="button"
                    >
                      {previewMode ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Edit Mode</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </>
                      )}
                    </Button>
                  </div>
                    {/* Always render the editor, but hide it when in preview mode */}
                  <div 
                    className="quill-container border rounded-md overflow-hidden" 
                    style={{ display: previewMode ? 'none' : 'block' }}
                  >
                    {typeof window !== 'undefined' && (
                      <ReactQuill
                        key="editor"
                        theme="snow"
                        defaultValue={content}
                        value={content}
                        onChange={(value) => {
                          // Only update if value is defined to prevent delta errors
                          if (value !== undefined) {
                            setContent(value);
                          }
                        }}
                        placeholder="Write your story..."
                        className="min-h-[420px]"
                        modules={quillModules}
                        formats={quillFormats}
                        preserveWhitespace={true}
                      />
                    )}
                  </div>
                  
                  {/* Show preview when in preview mode */}
                  {previewMode && (
                    <div className="border rounded-md overflow-hidden bg-white">
                      <BlogPreview 
                        title={title}
                        content={content}
                        coverImage={coverImagePreview}
                        tags={tags}
                        category={category}
                      />
                    </div>
                  )}
                  
                  {/* Word counter */}
                  <div className="mt-2">
                    <WordCounter content={content} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title (optional)</Label>
                  <Input 
                    id="metaTitle" 
                    placeholder="Enter meta title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)} 
                    className="mt-1" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended length: 50-60 characters
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="metaDescription">Meta Description (optional)</Label>
                  <Textarea 
                    id="metaDescription"
                    placeholder="Enter meta description"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended length: 150-160 characters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Blog Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Enter a brief summary of your blog"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category (optional)</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutorials">Tutorials</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="tips">Tips & Tricks</SelectItem>
                      <SelectItem value="resources">Resources</SelectItem>
                      <SelectItem value="case-studies">Case Studies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Type tags and press Enter or comma"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={handleTagsInput}
                    className="mt-1"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md flex items-center"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cover Image</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUpload">Upload image</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1"
                  />
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="imageUrl">Or enter image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={coverImage}
                    onChange={(e) => {
                      setCoverImage(e.target.value);
                      setCoverImagePreview(e.target.value);
                    }}
                    className="mt-1"
                  />
                </div>
                
                {coverImagePreview && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-1 relative h-40 rounded-md overflow-hidden border">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                        onError={() => {
                          setCoverImagePreview("/assets/images/placeholder.jpg");
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Publishing</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="your-blog-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be used in the URL: /blogs/{slug || "your-blog-slug"}
                  </p>
                </div>
                
                <div className="pt-4">
                  <Label>Publishing schedule</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="publishNow"
                        name="publishSchedule"
                        checked={publishImmediately}
                        onChange={() => setPublishImmediately(true)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="publishNow" className="cursor-pointer">
                        Publish immediately
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedulePublish"
                        name="publishSchedule"
                        checked={!publishImmediately}
                        onChange={() => setPublishImmediately(false)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="schedulePublish" className="cursor-pointer">
                        Schedule for later
                      </Label>
                    </div>
                    
                    {!publishImmediately && (
                      <div className="pl-6 pt-2">
                        <Input
                          type="datetime-local"
                          value={publishDate}
                          onChange={(e) => setPublishDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditing ? "Update" : "Publish"} Blog
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p>Loading blog data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
