"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseQuestionTimingProps {
  totalQuestions: number;
  isSubmitting: boolean;
}

/**
 * Custom hook to track time spent on each question in a quiz
 */
export function useQuestionTiming({ totalQuestions, isSubmitting }: UseQuestionTimingProps) {
  // Store time spent on each question
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  
  // Reference to track when current question started
  const questionStartTimeRef = useRef<number>(Date.now());
  // Reference to track the current question index
  const currentQuestionRef = useRef<number>(0);
  
  // Function to update time for the current question
  const updateCurrentQuestionTime = useCallback(() => {
    if (isSubmitting) return;
    
    const currentTime = Date.now();
    const timeSpent = Math.floor((currentTime - questionStartTimeRef.current) / 1000);
    
    if (timeSpent > 1) {
      const questionNumber = currentQuestionRef.current + 1;
      setQuestionTimes(prev => ({
        ...prev,
        [questionNumber]: (prev[questionNumber] || 0) + timeSpent
      }));
    }
    
    // Reset timer
    questionStartTimeRef.current = currentTime;
  }, [isSubmitting]);
  
  // Function to call when changing questions
  const handleQuestionChange = useCallback((newQuestionIndex: number) => {
    // Update time for the previous question
    updateCurrentQuestionTime();
    
    // Update the current question reference
    currentQuestionRef.current = newQuestionIndex;
  }, [updateCurrentQuestionTime]);
  
  // Initialize when the component mounts
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    
    // Clean up when unmounting - record final time
    return () => {
      if (!isSubmitting) {
        updateCurrentQuestionTime();
      }
    };
  }, [isSubmitting, updateCurrentQuestionTime]);
  
  return {
    questionTimes,
    handleQuestionChange,
    updateCurrentQuestionTime
  };
}
