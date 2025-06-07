"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    GripVertical, Image as ImageIcon, MoveHorizontal,
    PlusCircle,
    Save, Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

// Define types for flashcards
interface Flashcard {
  id: string;
  front: string;
  back: string;
  image?: string;
}

export default function FlashcardEditor({ params }: { params?: { id: string } }) {
  const router = useRouter();
  const isEditing = !!params?.id;
  
  // Loading state
  const [isLoading, setIsLoading] = useState(isEditing);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  // Load existing flashcard set if editing
  useEffect(() => {
    if (isEditing && params?.id) {
      const loadFlashcardSet = async () => {        try {
          const response = await fetch(`/api/admin/flashcard-sets/${params.id}`);
          if (!response.ok) {
            throw new Error('Failed to load flashcard set');
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to load flashcard set');
          }
          
          const data = result.data;
          
          setTitle(data.title || '');
          setDescription(data.description || '');
          
          // Handle flashcards array with proper null/undefined checks
          if (data.flashcards && Array.isArray(data.flashcards)) {
            setFlashcards(data.flashcards.map((card: any) => ({
              id: uuidv4(),
              front: card.question || '',
              back: card.answer || ''
            })));
          } else {
            // If no flashcards, start with one empty card
            setFlashcards([{
              id: uuidv4(),
              front: '',
              back: ''
            }]);
          }
        } catch (error) {
          console.error('Error loading flashcard set:', error);
          toast({
            title: "Error",
            description: "Failed to load flashcard set. Please try again.",
            variant: "destructive",
          });
          router.push("/admin/flashcards");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadFlashcardSet();
    }
  }, [isEditing, params?.id, router]);
  
  // Initialize with empty flashcard for new sets
  useEffect(() => {
    if (!isEditing && flashcards.length === 0) {
      setFlashcards([{
        id: uuidv4(),
        front: '',
        back: ''
      }]);
    }  }, [isEditing, flashcards.length]);

  // Handle drag and drop reordering
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(flashcards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFlashcards(items);
  };

  // Add new flashcard
  const addFlashcard = () => {
    const newCard: Flashcard = {
      id: uuidv4(),
      front: "",
      back: ""
    };
    
    setFlashcards([...flashcards, newCard]);
  };

  // Remove a flashcard
  const removeFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  // Update flashcard
  const updateFlashcard = (id: string, field: 'front' | 'back', value: string) => {
    setFlashcards(flashcards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  // Swap front and back
  const swapFrontBack = (id: string) => {
    setFlashcards(flashcards.map(card => 
      card.id === id ? { ...card, front: card.back, back: card.front } : card
    ));
  };
  // Save flashcard set
  const handleSave = async (isDraft: boolean = false) => {
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!title.trim()) {
        toast({ title: "Error", description: "Flashcard set title is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      if (flashcards.length === 0) {
        toast({ title: "Error", description: "Flashcard set must have at least one card", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      // Validate that each flashcard has front and back text
      for (const card of flashcards) {
        if (!card.front.trim() || !card.back.trim()) {
          toast({ title: "Error", description: "All flashcards must have both front and back content", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
      }
      
      const requestData = {
        title: title.trim(),
        description: description.trim(),
        flashcards: flashcards.map(card => ({
          question: card.front.trim(),
          answer: card.back.trim(),
          difficulty: "medium" // Default difficulty
        })),
        category: "General", // Default category for now
        published: !isDraft
      };

      const url = isEditing ? `/api/admin/flashcard-sets/${params?.id}` : '/api/admin/flashcard-sets';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save flashcard set');
      }

      const result = await response.json();
      
      toast({
        title: isDraft ? "Flashcard set saved as draft" : "Flashcard set published",
        description: isDraft ? "Your flashcard set has been saved as a draft" : "Your flashcard set has been published successfully",
      });
      
      router.push("/admin/flashcards");
    } catch (error) {
      console.error("Error saving flashcard set:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save flashcard set. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading flashcard set...</p>
          </div>
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center"
          >
            <Button variant="ghost" onClick={() => router.push("/admin/flashcards")} className="mr-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Flashcards
            </Button>
            <h1 className="text-3xl font-bold">{isEditing ? "Edit Flashcard Set" : "Create New Flashcard Set"}</h1>
          </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Set Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter flashcard set title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this flashcard set"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Flashcards 
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                ({flashcards.length} total)
              </span>
            </h2>
            <Button onClick={addFlashcard}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </div>
          
          {flashcards.length === 0 ? (
            <Card className="border-dashed border-2 p-8 text-center bg-background">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <PlusCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">No Flashcards Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Start creating your flashcard set by adding cards. Each card should have content
                  for both the front and back sides.
                </p>
                <Button onClick={addFlashcard}>
                  Add First Card
                </Button>
              </div>
            </Card>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="flashcards">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {flashcards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-card"
                          >
                            <CardContent className="p-0">
                              <div className="flex items-center gap-2 p-4 border-b bg-muted/40">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab p-1 hover:bg-muted rounded"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium">Card {index + 1}</span>
                                <div className="ml-auto flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => swapFrontBack(card.id)}
                                    title="Swap front and back"
                                  >
                                    <MoveHorizontal className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeFlashcard(card.id)}
                                    title="Remove card"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="p-4 space-y-4">
                                <div>
                                  <Label htmlFor={`front-${card.id}`}>Front</Label>
                                  <Textarea
                                    id={`front-${card.id}`}
                                    placeholder="Front side content"
                                    value={card.front}
                                    onChange={(e) => updateFlashcard(card.id, 'front', e.target.value)}
                                    className="mt-1 resize-none"
                                    rows={2}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`back-${card.id}`}>Back</Label>
                                  <Textarea
                                    id={`back-${card.id}`}
                                    placeholder="Back side content"
                                    value={card.back}
                                    onChange={(e) => updateFlashcard(card.id, 'back', e.target.value)}
                                    className="mt-1 resize-none"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="pt-2">
                                  <Label className="flex items-center gap-2 mb-2 cursor-pointer">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>Add Image (Optional)</span>
                                  </Label>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="max-w-full"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          
          <div className="mt-6">
            <Button onClick={addFlashcard} variant="outline" className="mr-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Card
            </Button>
          </div>
        </div>
          <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Publishing..." : "Publish Flashcard Set"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}            </Button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
