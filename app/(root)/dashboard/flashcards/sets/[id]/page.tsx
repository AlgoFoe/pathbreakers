"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Shuffle,
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FlashcardInSet {
  question: string;
  answer: string;
  difficulty: string;
}

interface FlashcardSetData {
  _id: string;
  title: string;
  description: string;
  category: string;
  flashcards: FlashcardInSet[];
  flashcardCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FlashcardSetStudyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<FlashcardInSet[]>([]);

  // Fetch flashcard set
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const response = await fetch(`/api/flashcard-sets/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard set');
        }

        const result = await response.json();
        
        if (result.success) {
          setFlashcardSet(result.data);
          setOriginalOrder([...result.data.flashcards]);
        } else {
          throw new Error(result.message || 'Failed to load flashcard set');
        }
      } catch (error) {
        console.error('Error fetching flashcard set:', error);
        toast({
          title: "Error",
          description: "Failed to load flashcard set. Please try again.",
          variant: "destructive",
        });
        router.push('/dashboard/flashcards');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSet();
  }, [params.id, router, toast]);

  const handleNextCard = () => {
    if (!flashcardSet) return;
    
    setStudiedCards(prev => new Set([...Array.from(prev), currentIndex]));
    
    if (currentIndex < flashcardSet.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleShuffle = () => {
    if (!flashcardSet) return;
    
    if (isShuffled) {
      // Restore original order
      setFlashcardSet({
        ...flashcardSet,
        flashcards: [...originalOrder]
      });
    } else {
      // Shuffle the cards
      const shuffled = [...flashcardSet.flashcards].sort(() => Math.random() - 0.5);
      setFlashcardSet({
        ...flashcardSet,
        flashcards: shuffled
      });
    }
    
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setStudiedCards(new Set());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading flashcard set...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Alert>
          <AlertDescription>
            Flashcard set not found or is not available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentCard = flashcardSet.flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcardSet.flashcards.length) * 100;
  const studiedProgress = (studiedCards.size / flashcardSet.flashcards.length) * 100;

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Set Info */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
        <p className="text-muted-foreground">{flashcardSet.description}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{flashcardSet.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{flashcardSet.flashcardCount} cards</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress: {currentIndex + 1} / {flashcardSet.flashcards.length}</span>
          <span>Studied: {studiedCards.size +1} / {flashcardSet.flashcards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={handleShuffle}>
          <Shuffle className="mr-2 h-4 w-4" />
          {isShuffled ? 'Original Order' : 'Shuffle'}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="min-h-[300px] cursor-pointer" onClick={handleFlipCard}>
                <CardContent className="p-8 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="flex justify-between items-center w-full">
                    <Badge className={getDifficultyColor(currentCard.difficulty)}>
                      {currentCard.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {showAnswer ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{showAnswer ? 'Answer' : 'Question'}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showAnswer ? 'answer' : 'question'}
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg leading-relaxed"
                      >
                        {showAnswer ? currentCard.answer : currentCard.question}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Click to {showAnswer ? 'show question' : 'reveal answer'}
                  </p>  
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {studiedCards.has(currentIndex) && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleNextCard}
          disabled={currentIndex === flashcardSet.flashcards.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Completion Message */}
      {studiedCards.size === flashcardSet.flashcards.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-green-50 rounded-lg border border-green-200"
        >
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
          <p className="text-green-700">You have studied all flashcards in this set.</p>
          <Button className="mt-4" onClick={handleReset}>
            Study Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
