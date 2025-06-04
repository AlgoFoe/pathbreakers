"use client";

import React, { useEffect, useRef } from 'react';

interface QuestionTimerProps {
  currentQuestionIndex: number;
  isSubmitting: boolean;
  onTimeUpdate: (questionNumber: number, timeSpent: number) => void;
}

/**
 * Component to track time spent on each quiz question
 */
export default function QuestionTimer({ 
  currentQuestionIndex, 
  isSubmitting,
  onTimeUpdate 
}: QuestionTimerProps) {
  // Store the timestamp when the question was first loaded
  const startTimeRef = useRef<number>(Date.now());
  // Store the question index to detect changes
  const questionIndexRef = useRef<number>(currentQuestionIndex);

  useEffect(() => {
    // If the question has changed, update the time for the previous question
    if (questionIndexRef.current !== currentQuestionIndex && !isSubmitting) {
      const currentTime = Date.now();
      const timeSpent = Math.floor((currentTime - startTimeRef.current) / 1000); // Convert to seconds
      
      // Only update if meaningful time was spent (more than 1 second)
      if (timeSpent > 1) {
        onTimeUpdate(questionIndexRef.current + 1, timeSpent);
      }
      
      // Reset the timer for the new question
      startTimeRef.current = currentTime;
      questionIndexRef.current = currentQuestionIndex;
    }
  }, [currentQuestionIndex, isSubmitting, onTimeUpdate]);

  // Effect to handle component unmounting or quiz submission
  useEffect(() => {
    // Return cleanup function to save time when component unmounts
    return () => {
      if (!isSubmitting) {
        const currentTime = Date.now();
        const timeSpent = Math.floor((currentTime - startTimeRef.current) / 1000);
        
        if (timeSpent > 1) {
          onTimeUpdate(questionIndexRef.current + 1, timeSpent);
        }
      }
    };
  }, [isSubmitting, onTimeUpdate]);

  // This is an invisible component that just manages timing logic
  return null;
}
