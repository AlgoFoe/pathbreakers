"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import FilterBar from '@/components/flashcards/FilterBar';
import FlashcardDialog from '@/components/flashcards/FlashcardDialog';
import CategoryCard from '@/components/flashcards/CategoryCard';
import FlashcardCarouselModal from '@/components/flashcards/FlashcardCarouselModal';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { metadata } from './metadata';

interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  createdAt?: Date;
}

interface FlashcardFormData {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

const FlashcardsPage = () => {
  const { toast } = useToast();
  
  // State
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [filteredCards, setFilteredCards] = useState<FlashcardType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // For category-based display and modal
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string>('');
  
  // Difficulties are predefined in our schema
  const difficulties = ["easy", "medium", "hard"];

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch flashcards whenever filters change
  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (selectedDifficulty !== 'all') {
          params.append('difficulty', selectedDifficulty);
        }
        if (debouncedSearchQuery) {
          params.append('query', debouncedSearchQuery);
        }

        // Make API call
        const url = `/api/flashcards${params.toString() ? `?${params.toString()}` : ''}`;
        console.log("Fetching flashcards from:", url);
        
        const response = await fetch(url, {
          headers: {
            'x-no-auth': 'true' // Signal that this request should bypass auth
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch flashcards: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setFlashcards(result.data);
          
          // Extract unique categories from flashcards
          const uniqueCategories = Array.from(
            new Set(result.data.map((card: FlashcardType) => card.category))
          ) as string[];
          setAllCategories(uniqueCategories);
        } else {
          throw new Error(result.message || 'Failed to fetch flashcards');
        }
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        toast({
          title: "Error",
          description: "Failed to load flashcards. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [debouncedSearchQuery, selectedCategory, selectedDifficulty, toast]);

  // Apply local filtering to flashcards
  useEffect(() => {
    let filtered = [...flashcards];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }
    
    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(card => card.difficulty === selectedDifficulty);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        card => 
          card.question.toLowerCase().includes(query) || 
          card.answer.toLowerCase().includes(query)
      );
    }
    
    setFilteredCards(filtered);
  }, [flashcards, selectedCategory, selectedDifficulty, searchQuery]);

  // Group flashcards by category for the category cards view
  const flashcardsByCategory = useMemo(() => {
    const grouped: { [key: string]: FlashcardType[] } = {};
    
    filteredCards.forEach(card => {
      if (!grouped[card.category]) {
        grouped[card.category] = [];
      }
      grouped[card.category].push(card);
    });
    
    return grouped;
  }, [filteredCards]);

  const handleCreateFlashcard = async (data: FlashcardFormData) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-no-auth': 'true'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create flashcard');
      }

      const result = await response.json();
      
      // Add the new flashcard to state
      setFlashcards(prev => [result.data, ...prev]);
      
      toast({
        title: "Success",
        description: "Flashcard created successfully",
      });
      
      // Add the category to categories list if it's new
      if (!allCategories.includes(data.category)) {
        setAllCategories(prev => [...prev, data.category]);
      }

      // Close the dialog
      setIsDialogOpen(false);
      
      return result.data;
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateFlashcard = async (id: string, data: FlashcardFormData) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-no-auth': 'true'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update flashcard');
      }

      const result = await response.json();
      
      // Update the flashcard in state
      setFlashcards(prev => 
        prev.map(card => 
          card._id === id ? result.data : card
        )
      );
      
      toast({
        title: "Success",
        description: "Flashcard updated successfully",
      });

      // Close the dialog
      setIsDialogOpen(false);
      setEditingCard(null);
      
      return result.data;
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to update flashcard. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
        headers: {
          'x-no-auth': 'true'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete flashcard');
      }

      await response.json();
      
      // Remove the flashcard from state
      setFlashcards(prev => prev.filter(card => card._id !== id));
      
      toast({
        title: "Success",
        description: "Flashcard deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSaveFlashcard = async (data: FlashcardFormData) => {
    if (editingCard) {
      return handleUpdateFlashcard(editingCard._id, data);
    } else {
      return handleCreateFlashcard(data);
    }
  };

  const handleEditFlashcard = (card: FlashcardType) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCard(null);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategoryForModal(category);
    setIsCarouselModalOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <FilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        onCreateNew={() => setIsDialogOpen(true)}
        categories={allCategories}
        difficulties={difficulties}
        onRefresh={() => {
          // Trigger a refresh by forcing the useEffect to run again
          setSelectedCategory('all');
          setSelectedDifficulty('all');
          setSearchQuery('');
        }}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading flashcards...</span>
        </div>
      ) : filteredCards.length === 0 ? (
        <Alert>
          <AlertDescription>
            No flashcards found. Try adjusting your filters or create a new flashcard.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(flashcardsByCategory).map(([category, cards]) => (
            <CategoryCard 
              key={category}
              category={category}
              count={cards.length}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      )}

      <FlashcardDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveFlashcard}
        initialData={editingCard ? {
          question: editingCard.question,
          answer: editingCard.answer,
          category: editingCard.category,
          difficulty: editingCard.difficulty,
        } : undefined}
        isEditing={!!editingCard}
        categories={allCategories}
      />

      <FlashcardCarouselModal 
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
        flashcards={filteredCards.filter(card => card.category === selectedCategoryForModal)}
        categoryName={selectedCategoryForModal}
        onEditCard={(card) => {
          setIsCarouselModalOpen(false);
          const cardToEdit = filteredCards.find(c => c._id === card);
          if (cardToEdit) {
            handleEditFlashcard(cardToEdit);
          }
        }}
        onDelete={(id) => handleDeleteFlashcard(id)}
      />
    </div>
  );
};

export default FlashcardsPage;