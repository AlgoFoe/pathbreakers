"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import Flashcard from './Flashcard';
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

interface FlashcardCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: FlashcardType[];
  categoryName: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const FlashcardCarouselModal: React.FC<FlashcardCarouselModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  categoryName,
  onEdit,
  onDelete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Reset index when modal opens or flashcards change
  useEffect(() => {
    setCurrentIndex(0);
  }, [isOpen, flashcards]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const currentCard = flashcards[currentIndex];

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 300 : -300,
        opacity: 0
      };
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{categoryName} Flashcards</DialogTitle>
          <DialogDescription>
            Card {currentIndex + 1} of {flashcards.length}
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[400px] mt-4">
          {/* Navigation buttons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrev}
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Flashcard Carousel */}
          <div className="h-full mx-10">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="h-full w-full absolute"
              >
                {currentCard && (
                  <Flashcard
                    id={currentCard._id}
                    question={currentCard.question}
                    answer={currentCard.answer}
                    category={currentCard.category}
                    difficulty={currentCard.difficulty}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-4">
          {flashcards.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`w-2 h-2 rounded-full p-0 ${
                index === currentIndex ? "bg-black" : "bg-gray-300"
              }`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardCarouselModal;
