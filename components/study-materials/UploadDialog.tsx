"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  categories: string[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, onClose, onUploadSuccess, categories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category) newErrors.category = "Category is required";
    if (!file) newErrors.file = "File is required";
    else if (file.size > MAX_FILE_SIZE) newErrors.file = "File size exceeds 10MB";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Clear file size error if it exists
      if (errors.file && selectedFile.size <= MAX_FILE_SIZE) {
        const { file, ...rest } = errors;
        setErrors(rest);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsUploading(true);
    
    try {
      // In a real implementation, upload file to storage service first
      // Then save metadata to your database
      
      // Mock upload process for now
      // 1. First we would upload the file to a storage service (AWS S3, Firebase Storage, etc.)
      // const uploadResponse = await uploadFileToStorage(file);
      // const fileUrl = uploadResponse.url;
      
      // 2. Then we would save the metadata to our database
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('file', file!);
      
      const response = await fetch('/api/study-materials', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload material');
      }
      
      toast({
        title: "Success!",
        description: "Study material uploaded successfully.",
        variant: "default",
      });
      
      onUploadSuccess();
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error uploading study material:', error);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload material",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setFile(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., CUET Physics Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this study material"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(category => category !== "All")
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">Upload File (PDF, max 10MB)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className={`flex-1 border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${errors.file ? "border-red-500" : "border-gray-300"}`}>
                  <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                    {file ? (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.preventDefault();
                              setFile(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload</span>
                        <span className="text-xs text-gray-400 mt-1">PDF (Max 10MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              {errors.file && <p className="text-red-500 text-xs">{errors.file}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
