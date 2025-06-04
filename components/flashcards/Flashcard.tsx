"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Check, X, Edit, Trash2, Star } from "lucide-react";

interface FlashcardProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-red-100 text-red-700 border-red-300",
};

const Flashcard: React.FC<FlashcardProps> = ({
  id,
  question,
  answer,
  category,
  difficulty,
  onEdit,
  onDelete,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isKnown, setIsKnown] = useState<boolean | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = (e: React.MouseEvent, known: boolean) => {
    e.stopPropagation(); // Prevent card from flipping
    setIsKnown(known);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping
    setIsKnown(null);
  };

  return (
    <motion.div
      className="w-full h-[300px] perspective-1000"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className={`w-full h-full relative preserve-3d cursor-pointer ${
          isKnown === true 
            ? "border-2 border-green-400" 
            : isKnown === false 
              ? "border-2 border-red-400" 
              : ""
        }`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleFlip}
      >
        {/* Front of card - Question */}
        <Card className="absolute w-full h-full backface-hidden bg-white p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div 
              className={`py-1 px-3 rounded-full text-xs font-medium ${difficultyColors[difficulty as keyof typeof difficultyColors]}`}
            >
              {difficulty}
            </div>
            <div className="text-xs text-gray-500 font-medium bg-gray-100 py-1 px-3 rounded-full">
              {category}
            </div>
          </div>
          
          <div className="flex-grow flex items-center justify-center mb-4">
            <p className="text-lg font-medium text-center">{question}</p>
          </div>
          
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-500">Tap to flip</div>
          </div>
        </Card>
        
        {/* Back of card - Answer */}
        <Card className="absolute w-full h-full backface-hidden bg-gray-50 p-6 flex flex-col rotate-y-180">
          <div className="flex justify-between items-start mb-4">
            <div 
              className={`py-1 px-3 rounded-full text-xs font-medium ${difficultyColors[difficulty as keyof typeof difficultyColors]}`}
            >
              {difficulty}
            </div>
            <div className="text-xs text-gray-500 font-medium bg-gray-100 py-1 px-3 rounded-full">
              {category}
            </div>
          </div>
          
          <div className="flex-grow flex items-center justify-center mb-4">
            <p className="text-lg text-center">{answer}</p>
          </div>
          
          <div className="border-t border-gray-100 pt-4 flex justify-between">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className={`border ${isKnown === true ? 'bg-green-100 text-green-700 border-green-300' : ''}`}
                onClick={(e) => handleKnown(e, true)}
              >
                <Check className="mr-1 h-4 w-4" />
                I knew this
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`border ${isKnown === false ? 'bg-red-100 text-red-700 border-red-300' : ''}`}
                onClick={(e) => handleKnown(e, false)}
              >
                <X className="mr-1 h-4 w-4" />
                Still learning
              </Button>
            </div>
            <div className="text-sm text-gray-500">Tap to flip</div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Flashcard;
