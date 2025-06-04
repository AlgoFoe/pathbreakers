"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface FlashcardFormData {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

interface FlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FlashcardFormData) => Promise<void>;
  initialData?: FlashcardFormData;
  isEditing?: boolean;
  categories: string[];
}

const FlashcardDialog: React.FC<FlashcardDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
  categories
}) => {
  const [formData, setFormData] = useState<FlashcardFormData>({
    question: '',
    answer: '',
    category: '',
    difficulty: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        question: '',
        answer: '',
        category: '',
        difficulty: 'medium',
      });
    }
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.question.trim()) newErrors.question = "Question is required";
    if (!formData.answer.trim()) newErrors.answer = "Answer is required";
    if (!formData.category) newErrors.category = "Category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FlashcardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      const { [field]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      
      toast({
        title: `Flashcard ${isEditing ? 'updated' : 'created'} successfully!`,
        variant: "default",
      });
      
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} flashcard`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      difficulty: 'medium',
    });
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
          <DialogTitle>{isEditing ? 'Edit Flashcard' : 'Create New Flashcard'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={formData.question}
                onChange={(e) => handleChange('question', e.target.value)}
                className={errors.question ? "border-red-500" : ""}
                rows={3}
              />
              {errors.question && <p className="text-red-500 text-xs">{errors.question}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer here..."
                value={formData.answer}
                onChange={(e) => handleChange('answer', e.target.value)}
                className={errors.answer ? "border-red-500" : ""}
                rows={3}
              />
              {errors.answer && <p className="text-red-500 text-xs">{errors.answer}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => handleChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? `${isEditing ? "Updating..." : "Creating..."}`
                : `${isEditing ? "Update" : "Create"} Flashcard`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardDialog;
