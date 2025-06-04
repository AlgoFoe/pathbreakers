"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import FilterBar from '@/components/flashcards/FilterBar';
import FlashcardDialog from '@/components/flashcards/FlashcardDialog';
// import SeedFlashcardsButton from '@/components/flashcards/SeedButton';
import CategoryCard from '@/components/flashcards/CategoryCard';
import FlashcardCarouselModal from '@/components/flashcards/FlashcardCarouselModal';
import { createFlashcard, updateFlashcard, deleteFlashcard, getFlashcards, FlashcardData } from '@/lib/actions/flashcard.actions';
// CSS styles are now in globals.css
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';

interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  createdAt?: Date;
}

interface FlashcardsClientProps {
  initialFlashcards: FlashcardType[];
  categories: string[];
  difficulties: string[];
}

const FlashcardsClient: React.FC<FlashcardsClientProps> = ({
  initialFlashcards,
  categories,
  difficulties,
}) => {  
  // State
  const [flashcards, setFlashcards] = useState<FlashcardType[]>(initialFlashcards || []);
  const [filteredCards, setFilteredCards] = useState<FlashcardType[]>(initialFlashcards || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // For category-based display and modal
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const { toast } = useToast();  // Filter and search logic
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        // If there are active filters, fetch from API
        if ((selectedCategory && selectedCategory !== 'all') || 
            (selectedDifficulty && selectedDifficulty !== 'all') || 
            debouncedSearchTerm) {
          const filteredData = await getFlashcards({
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
            query: debouncedSearchTerm || undefined,
          });
          setFilteredCards(filteredData);
        } else {
          // Otherwise use the existing cards
          setFilteredCards(flashcards);
        }
      } catch (error) {
        console.error('Error filtering flashcards:', error);
        toast({
          title: 'Error',
          description: 'Failed to filter flashcards',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [debouncedSearchTerm, selectedCategory, selectedDifficulty, refreshTrigger, flashcards, toast]);

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const freshData = await getFlashcards();
      setFlashcards(freshData);
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: 'Success',
        description: 'Flashcards refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh flashcards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating new flashcard
  const handleCreateNew = () => {
    setEditingCard(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing flashcard
  const handleEdit = (id: string) => {
    const card = flashcards.find(card => card._id === id);
    if (card) {
      setEditingCard({
        id: card._id,
        question: card.question,
        answer: card.answer,
        category: card.category,
        difficulty: card.difficulty,
      });
      setIsDialogOpen(true);
    }
  };

  // Save flashcard (create or update)
  const handleSaveFlashcard = async (data: FlashcardData) => {
    try {
      if (editingCard?.id) {
        await updateFlashcard(editingCard.id, data);
        setFlashcards(prev => 
          prev.map(card => card._id === editingCard.id 
            ? { ...card, ...data } 
            : card
          )
        );
      } else {
        const newCard = await createFlashcard(data);
        setFlashcards(prev => [newCard, ...prev]);
      }
      
      // Trigger a refresh of filtered cards
      setRefreshTrigger(prev => prev + 1);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving flashcard:', error);
      return Promise.reject(error);
    }
  };

  // Delete flashcard
  const handleDelete = async (id: string) => {
    try {
      await deleteFlashcard(id);
      setFlashcards(prev => prev.filter(card => card._id !== id));
      setFilteredCards(prev => prev.filter(card => card._id !== id));
      
      toast({
        title: 'Success',
        description: 'Flashcard deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flashcard',
        variant: 'destructive',
      });
    }
  };
  // Force refresh after seeding
  const handleSeedComplete = () => {
    handleRefresh();
  };
  
  // Group flashcards by category for the new UI
  const flashcardsByCategory = useMemo(() => {
    const grouped: Record<string, FlashcardType[]> = {};
    
    filteredCards.forEach(card => {
      if (!grouped[card.category]) {
        grouped[card.category] = [];
      }
      grouped[card.category].push(card);
    });
    
    return grouped;
  }, [filteredCards]);
  
  // Get flashcards of the selected category
  const selectedCategoryFlashcards = useMemo(() => {
    return flashcardsByCategory[selectedCategoryForModal] || [];
  }, [flashcardsByCategory, selectedCategoryForModal]);
  
  // Handle opening the carousel modal
  const handleCategoryClick = (category: string) => {
    setSelectedCategoryForModal(category);
    setIsCarouselModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          onCreateNew={handleCreateNew}
          categories={categories}
          difficulties={difficulties}
          onRefresh={handleRefresh}
        />
        
        {/* <div className="self-end sm:self-auto">
          <SeedFlashcardsButton />
        </div> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : Object.keys(flashcardsByCategory).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {Object.entries(flashcardsByCategory).map(([category, cards]) => (
              <motion.div 
                key={category}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryCard 
                  category={category} 
                  count={cards.length} 
                  onClick={() => handleCategoryClick(category)} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 px-6">
          <Alert>
            <AlertDescription className="text-center">
              {initialFlashcards.length === 0
                ? "No flashcards found. Create a new flashcard or use the Seed button to generate sample flashcards."
                : "No flashcards match your current filters. Try adjusting your search criteria."}
            </AlertDescription>
          </Alert>
        </Card>
      )}      <FlashcardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveFlashcard}
        initialData={editingCard || undefined}
        isEditing={!!editingCard}
        categories={categories}
      />
      
      {/* Carousel Modal for viewing flashcards by category */}
      <FlashcardCarouselModal
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
        flashcards={selectedCategoryFlashcards}
        categoryName={selectedCategoryForModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default FlashcardsClient;
