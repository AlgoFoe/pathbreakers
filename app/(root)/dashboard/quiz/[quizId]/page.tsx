"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type QuestionStatus = "not-visited" | "answered" | "un-answered" | "review" | "review-with-answer";

type QuizQuestion = {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
};

type Quiz = {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: QuizQuestion[];
};

// Type for tracking time spent on each question
type QuestionTiming = {
  startTime: number; // Timestamp when question was shown
  totalTimeSpent: number; // Total time in seconds spent on this question
};

export default function QuizExamPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  
  // Quiz data and state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});  // Timer state - simplified
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Tab visibility tracking
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState<boolean>(false);
  const documentHiddenRef = useRef<boolean>(false);
  // Question timing state - using refs to avoid re-renders
  const questionTimingsRef = useRef<Record<number, QuestionTiming>>({});
  const currentQuestionStartTimeRef = useRef<number>(0);
    // Submission state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const isSubmittingRef = useRef(false);
  const hasBeenSubmittedRef = useRef(false);

  const recordCurrentQuestionTime = useCallback(() => {
    if (hasBeenSubmittedRef.current || !quiz) return;
    
    const questionNumber = currentQuestionIndex + 1;
    const now = Date.now();
    
    if (currentQuestionStartTimeRef.current > 0) {
      const timeSpentMs = now - currentQuestionStartTimeRef.current;
      
      if (timeSpentMs >= 100) {
        // Initialize if this is the first time on this question
        if (!questionTimingsRef.current[questionNumber]) {
          questionTimingsRef.current[questionNumber] = {
            startTime: currentQuestionStartTimeRef.current,
            totalTimeSpent: 0
          };
        }
        
        questionTimingsRef.current[questionNumber].totalTimeSpent += (timeSpentMs / 1000);
      }
    }
    
    currentQuestionStartTimeRef.current = now;
  }, [currentQuestionIndex, quiz]);// Format time from seconds to HH:MM:SS
    // Format time from seconds to HH:MM:SS
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);  // Debug logging for timer and question timing tracking
  useEffect(() => {
    if (!quiz || !timeRemaining) return;
    
    // Only log occasionally to avoid console spam
    if (timeRemaining % 30 === 0 || timeRemaining <= 10) {
      console.log(`Timer update: ${formatTime(timeRemaining)}`);
    }
    
    // Track question timing even when timer updates
    if (!hasBeenSubmittedRef.current && currentQuestionStartTimeRef.current > 0) {
      // No need to call recordCurrentQuestionTime() here as it would reset the start time
    }
  }, [timeRemaining, quiz, formatTime]);
  
  // Get CSS class for question status
  const getStatusColor = useCallback((status: QuestionStatus): string => {
    switch (status) {
      case "answered": return "bg-lime-400";
      case "not-visited": return "bg-slate-700";
      case "un-answered": return "bg-amber-500";
      case "review": return "bg-teal-400";
      case "review-with-answer": return "bg-teal-600";
      default: return "bg-slate-700";
    }
  }, []);

  // ======== EVENT HANDLERS ========
    // Handle selecting an answer
  const handleSelectAnswer = useCallback((value: string) => {
    if (!quiz || hasBeenSubmittedRef.current) return;
    
    console.log(`Selected answer for question ${currentQuestionIndex + 1}: ${value}`);
    
    // Update the selected answer
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      newAnswers[currentQuestionIndex + 1] = value;
      return newAnswers;
    });
    
    // Update question status based on whether it's marked for review
    setQuestionStatuses(prev => {
      const isMarked = markedForReview[currentQuestionIndex + 1];
      return {
        ...prev,
        [currentQuestionIndex + 1]: isMarked ? "review-with-answer" : "answered"
      };
    });
  }, [currentQuestionIndex, markedForReview, quiz]);
  
  // Handle navigating to a specific question
  const handleNavigateQuestion = useCallback((index: number) => {
    if (hasBeenSubmittedRef.current || index === currentQuestionIndex) return;
    
    // Record time spent on current question
    recordCurrentQuestionTime();
    
    setCurrentQuestionIndex(index);
    
    if (questionStatuses[index + 1] === "not-visited") {
      setQuestionStatuses(prev => ({
        ...prev,
        [index + 1]: "un-answered"
      }));
    }
  }, [currentQuestionIndex, questionStatuses, recordCurrentQuestionTime]);
  
  // Handle going to next question
  const handleNextQuestion = useCallback(() => {
    if (!quiz || hasBeenSubmittedRef.current) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      // Record time spent on current question
      recordCurrentQuestionTime();
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      if (questionStatuses[currentQuestionIndex + 2] === "not-visited") {
        setQuestionStatuses(prev => ({
          ...prev,
          [currentQuestionIndex + 2]: "un-answered"
        }));
      }
    }
  }, [currentQuestionIndex, quiz, questionStatuses, recordCurrentQuestionTime]);
  
  // Handle going to previous question
  const handlePrevQuestion = useCallback(() => {
    if (hasBeenSubmittedRef.current) return;
    
    if (currentQuestionIndex > 0) {
      // Record time spent on current question
      recordCurrentQuestionTime();
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, recordCurrentQuestionTime]);
    // Handle marking question for review
  const handleMarkForReview = useCallback(() => {
    if (hasBeenSubmittedRef.current) return;
    
    console.log(`Marking question ${currentQuestionIndex + 1} for review`);
    
    // Mark this question for review
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestionIndex + 1]: true
    }));
    
    // Update the question status based on whether it has an answer
    setQuestionStatuses(prev => {
      const currentStatus = prev[currentQuestionIndex + 1];
      
      // If it's answered or already reviewed with answer, make it review-with-answer
      // Otherwise just mark for review
      const newStatus: QuestionStatus = 
        currentStatus === "answered" || currentStatus === "review-with-answer" 
          ? "review-with-answer" 
          : "review";
          
      console.log(`Question status change: ${currentStatus} -> ${newStatus}`);
      
      return {
        ...prev,
        [currentQuestionIndex + 1]: newStatus
      };
    });
  }, [currentQuestionIndex]);    // Handle clearing an answer
  const handleClearSelection = useCallback(() => {
    if (hasBeenSubmittedRef.current) return;
    
    console.log(`Clearing answer for question ${currentQuestionIndex + 1}`);
    
    // Instead of deleting the answer, set it to an empty string
    // This ensures the RadioGroup value won't match any option ID
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      newAnswers[currentQuestionIndex + 1] = ""; // Empty string won't match any option ID
      return newAnswers;
    });
    
    // Update status - if marked for review, keep it as "review", otherwise "un-answered"
    setQuestionStatuses(prev => {
      const isMarked = markedForReview[currentQuestionIndex + 1];
      const newStatus = isMarked ? "review" : "un-answered";
      
      console.log(`Question status after clearing: ${newStatus} (marked: ${isMarked})`);
      
      return {
        ...prev,
        [currentQuestionIndex + 1]: newStatus
      };
    });
  }, [currentQuestionIndex, markedForReview]);

  // ======== CORE FUNCTIONALITY ========
    // Submit quiz function
  const submitQuiz = useCallback(async () => {
    // Reduce verbose logging
    // console.log("submitQuiz called | submitting:", isSubmittingRef.current, "submitted:", hasBeenSubmittedRef.current);
    
    // Avoid multiple submissions
    if (isSubmittingRef.current || hasBeenSubmittedRef.current || !quiz) {
      // console.log("Already submitting or submitted - ignoring call");
      return;
    }
    
    // Record time on final question
    recordCurrentQuestionTime();
    
    // Set flags to prevent multiple submissions
    isSubmittingRef.current = true;
    hasBeenSubmittedRef.current = true;
    
    try {      // console.log("Starting quiz submission process");      // Stop the timer to prevent further updates
      if (timerIntervalRef.current) {
        console.log("Stopping timer on quiz submission");
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        // Don't need to call any flags as those were removed
      }
        // No fullscreen to exit
      
      // Prepare submission data
      const totalTimeSpent = quiz.duration * 60 - timeRemaining;
      console.log("Total time spent on quiz:", totalTimeSpent, "seconds");
        // Convert question timings to proper format
      const questionTimes: Record<number, number> = {};
      Object.entries(questionTimingsRef.current).forEach(([qNum, timing]) => {
        questionTimes[parseInt(qNum)] = Math.round(timing.totalTimeSpent);
      });
      
      // Reduce console logs
      // console.log("Question timing data:", questionTimes);      // Format answers in the correct structure for the API
      const formattedAnswers: Record<string, {
        selectedOption: string | null;
        correctOption: string;
        status: string;
      }> = {};
        // Process each question
      quiz.questions.forEach((question, index) => {
        const questionId = question.id.toString();
        const questionNumber = index + 1;
        // Treat empty strings as null (no selection)
        const selectedOption = (selectedAnswers[questionNumber] && selectedAnswers[questionNumber] !== "") 
          ? selectedAnswers[questionNumber] 
          : null;
        const status = questionStatuses[questionNumber] || "not-visited";
        
        console.log(`Question ${questionNumber} (ID: ${questionId}): Status=${status}, Selected=${selectedOption}`);
        
        formattedAnswers[questionId] = {
          selectedOption,
          correctOption: "", // Server will fill this in for security reasons
          status
        };
      });
      
      // Prepare data for submission
      const submissionData = {
        answers: formattedAnswers,
        timeSpent: totalTimeSpent,
        questionTimes: questionTimes
      };
      
      try {
        // Submit answers to API
        const response = await fetch(`/api/quizzes/${quiz.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        console.log("API response received");
      } catch (apiError) {
        console.error("API error during submission:", apiError);
      }
      
      // Redirect to results page regardless of API success
      console.log("Redirecting to results page");
      setTimeout(() => {
        router.push(`/dashboard/quiz/results/${quiz.id}`);
      }, 300);
      
    } catch (error) {
      console.error('Uncaught error during quiz submission:', error);
      
      // For development - still redirect if there was an error
      setTimeout(() => {
        router.push(`/dashboard/quiz/results/${params.quizId}`);
      }, 300);
    }
  }, [quiz, router, params.quizId, timeRemaining, selectedAnswers, questionStatuses, recordCurrentQuestionTime]);

  // ======== EFFECTS ========
    // Fetch quiz data - only once when component mounts
  useEffect(() => {
    if (hasBeenSubmittedRef.current) return;
    
    let isMounted = true;
    console.log("Initializing quiz");
    
    const fetchQuiz = async () => {
      try {
        console.log("Fetching quiz data");
        const response = await fetch(`/api/quizzes/${params.quizId}`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const quizData = await response.json();
        
        if (!isMounted) return;
        
        // Transform the data
        const formattedQuiz: Quiz = {
          id: quizData.id,
          title: quizData.title,
          duration: quizData.duration,
          questions: quizData.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: ''  // don't send correct answer to client
          }))
        };
        
        console.log(`Quiz loaded with ${formattedQuiz.questions.length} questions and ${formattedQuiz.duration} minutes duration`);
        
        // Initialize question statuses
        const initialStatuses = formattedQuiz.questions.reduce((acc, q, i) => {
          return { ...acc, [i + 1]: i === 0 ? "un-answered" : "not-visited" };
        }, {});
        
        setQuiz(formattedQuiz);
        setQuestionStatuses(initialStatuses);
        setLoading(false);
        
        // Initialize question timing
        currentQuestionStartTimeRef.current = Date.now();
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();
    
    return () => {
      isMounted = false;
    };
  }, [params.quizId]);// Single-run timer initialization and countdown
  useEffect(() => {
    // Set up the timer once when quiz loads and is not yet submitted
    if (!quiz || hasBeenSubmittedRef.current) return;
    
    console.log('Initializing quiz timer once. Duration:', quiz.duration, 'minutes');
    
    // Calculate total seconds for the quiz duration and set it once
    const initialTimeInSeconds = quiz.duration * 60;
    
    // Set initial time
    setTimeRemaining(initialTimeInSeconds);
    
    // Store start time and calculate end time
    const startTime = Date.now();
    const endTime = startTime + (initialTimeInSeconds * 1000);
    
    // Using a ref for the interval ID to prevent it from being part of the dependency array
    const timerIntervalId = setInterval(() => {
      const now = Date.now();
      const secondsRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeRemaining(secondsRemaining);
      
      // If time is up, submit the quiz
      if (secondsRemaining <= 0) {
        console.log('Time is up! Submitting quiz automatically.');
        clearInterval(timerIntervalId);
        submitQuiz();
      }
    }, 1000);
    
    // Store the interval ID reference
    timerIntervalRef.current = timerIntervalId;
    
    console.log('Timer initialized and running with:', formatTime(initialTimeInSeconds));
    
    // Add confirmation for page unload/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show confirmation if quiz is in progress
      if (isSubmittingRef.current || hasBeenSubmittedRef.current) return;
      
      const message = "Leaving this page will end your quiz attempt. Are you sure you want to leave?";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function only runs when component unmounts or dependencies change
    return () => {
      console.log('Cleaning up timer on unmount or dependency change');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    
    // Important: Only run this effect once when quiz is loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id, quiz?.duration]);
  // Implement tab visibility detection with dialog warning
  useEffect(() => {
    if (!quiz || hasBeenSubmittedRef.current) return;
  
    // Handler for visibility change
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      
      // If document becomes hidden (user switches tab/minimizes)
      if (isHidden && !documentHiddenRef.current) {
        documentHiddenRef.current = true;
        console.log('Tab visibility changed: Document is now hidden');
        
        // Increment the tab switch count with a safer approach
        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;
          console.log(`Tab switch detected. Count: ${newCount}`);
          
          // Schedule these state changes and checks to be run after state update
          setTimeout(() => {
            if (newCount === 1) {
              // First occurrence - show warning
              console.log('First tab switch - showing warning');
              setShowVisibilityWarning(true);
            } else if (newCount >= 2) {
              // Second occurrence - submit quiz automatically
              console.log('Second tab switch detected. Submitting quiz automatically.');
              submitQuiz();
            }
          }, 0);
          
          return newCount;
        });
      } else if (!isHidden && documentHiddenRef.current) {
        // Document becomes visible again
        documentHiddenRef.current = false;
        console.log('Tab visibility changed: Document is now visible');
      }
    };
  
    // Add the visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quiz, submitQuiz]);
    return (
    <div className="flex flex-col min-h-full py-6 px-4 lg:px-8">
      {/* Tab visibility warning dialog */}
      <AlertDialog open={showVisibilityWarning} onOpenChange={setShowVisibilityWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning: Tab Switch Detected</AlertDialogTitle>
            <AlertDialogDescription>
              You have switched tabs or minimized the window during the quiz.
              <br /><br />
              <strong>This is your first warning.</strong> If you switch tabs or minimize the window again, your quiz will be automatically submitted.
              <br /><br />
              Please keep this tab focused until you complete the quiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowVisibilityWarning(false)}
              className="bg-black hover:bg-gray-800"
            >
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex-1 w-full max-w-7xl mx-auto">
        {/* Header */}
        
        
        {/* Main quiz layout with questions and navigation panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Questions area - fixed width */}
          <div className="w-full lg:w-3/4 lg:max-w-4xl">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <span className="text-lg text-gray-500">Loading quiz...</span>
              </div>
            ) : (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mb-0"
              >
                {/* Question card */}
                <Card className="p-6 shadow-md rounded-lg h-[31.5rem]">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      Question {currentQuestionIndex + 1} of {quiz ? quiz.questions.length : 0}
                    </h2>
                  </div>
                  
                  <div className="mb-4">
                    {/* Question text - now always rendered as HTML */}
                    {quiz && quiz.questions && quiz.questions[currentQuestionIndex] && (
                      <div
                        className="text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: quiz.questions[currentQuestionIndex].question }}
                      />
                    )}
                  </div>
                  
                  <div className="mb-4">
                    {/* Options - improved with better styling for radio buttons */}
                    <RadioGroup
                      value={selectedAnswers[currentQuestionIndex + 1] || ""}
                      onValueChange={handleSelectAnswer}
                      className="space-y-3"
                    >
                      {quiz && quiz.questions && quiz.questions[currentQuestionIndex] && 
                       quiz.questions[currentQuestionIndex].options.map(option => (
                        <label
                          key={option.id}
                          htmlFor={option.id}
                          className={cn(
                            "flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer", 
                            selectedAnswers[currentQuestionIndex + 1] === option.id 
                              ? option.id === quiz.questions[currentQuestionIndex].correctAnswer
                                ? "border-black bg-gray-100" 
                                : "border-black bg-gray-100"
                              : "border-gray-300 hover:border-gray-400 bg-white"
                          )}
                        >
                          <div className="flex items-center w-full">
                            <RadioGroupItem
                              id={option.id}
                              value={option.id}
                              className="mr-3"
                            />
                            <span className="flex-1 text-lg text-black">
                              {option.text}
                            </span>
                            {hasBeenSubmittedRef.current && option.id === quiz.questions[currentQuestionIndex].correctAnswer && (
                              <div className="ml-4">
                                <Check className="w-5 h-5 text-lime-400" />
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  {/* Navigation buttons - always show next and previous buttons */}
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0 || hasBeenSubmittedRef.current}
                      className="flex mr-2"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!quiz || currentQuestionIndex === quiz.questions.length - 1 || hasBeenSubmittedRef.current}
                      className="flex ml-2"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>                {/* Submit and other action buttons */}
                <div className="mt-8 flex justify-between gap-2 flex-wrap">                  
                  <Button
                    onClick={handleMarkForReview}
                    disabled={loading || hasBeenSubmittedRef.current}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Mark for Review
                  </Button>
                  
                  <Button
                    onClick={() => setShowSummaryDialog(true)}
                    disabled={loading || hasBeenSubmittedRef.current}
                    className="bg-sky-500 hover:bg-blue-700 text-white"
                  >
                    Summary
                  </Button>
                  
                  <Button
                    onClick={handleClearSelection}
                    disabled={loading || hasBeenSubmittedRef.current || !selectedAnswers[currentQuestionIndex + 1]}
                    className="bg-slate-500 hover:bg-slate-600"
                  >
                    Clear Selection
                  </Button>
                  
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={loading || hasBeenSubmittedRef.current}
                    className="bg-green-700 hover:bg-green-800 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </motion.div>
            )}
            
          </div>
            {/* Navigation panel - sidebar */}
          <div className="w-full lg:w-[20rem] mb-6 lg:mb-0">
            <Card className="p-4 shadow-md rounded-lg h-[20rem]">
              <div className="flex gap-2 items-center justify-between">
              <h3 className="text-lg font-semibold mb-2">Questions</h3>
                <div className="flex-col -translate-y-1 px-1">
                  <span className="text-md font-semibold -translate-y-1">{formatTime(timeRemaining)}</span>
                  <Progress className="h-1.5 bg-gray-400 w-full" value={(currentQuestionIndex + 1) / (quiz ? quiz.questions.length : 1) * 100} />
                </div>
              </div>
              
              {/* Status legend */}
              <div className="mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-lime-400"></div>
                    <span className="text-md">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span className="text-md">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-teal-400"></div>
                    <span className="text-md">Mark for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-700"></div>
                    <span className="text-md">Not Visited</span>
                  </div>
                </div>
              </div>
              
              {/* Questions grid */}
              <div className="grid grid-cols-5 gap-2 p-1 overflow-auto min-h-[10rem] max-h-[10rem]">
                {quiz && quiz.questions.map((_, index) => {
                  const questionNumber = index + 1;
                  const status = questionStatuses[questionNumber];
                  
                  return (
                    <Button
                      key={questionNumber}
                      onClick={() => handleNavigateQuestion(index)}
                      className={cn(
                        "flex items-center justify-center h-10 text-sm font-medium", 
                        getStatusColor(status),
                        currentQuestionIndex === index ? "ring-2 ring-black ring-offset-2" : ""
                      )}
                    >
                      {questionNumber}
                    </Button>
                  );
                })}
              </div>
                {/* No quiz summary here anymore - moved to dialog */}
            </Card>
          </div>
        </div>
          {/* Submit confirmation dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit the quiz? You won&apos;t be able to change your answers after submission.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={submitQuiz}
                className="bg-black hover:bg-gray-800"
              >
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Quiz Summary dialog */}
        <AlertDialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Quiz Summary</AlertDialogTitle>
              <AlertDialogDescription>
                Current status of your quiz attempt
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {quiz && (
              <div className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-lime-400"></div>
                      <span className="font-semibold text-md">Answered:</span>
                    </div>
                    <span className="font-semibold text-md">
                      {Object.values(questionStatuses).filter(s => 
                        s === "answered" || s === "review-with-answer"
                      ).length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                      <span className="font-semibold text-md">Unanswered:</span>
                    </div>
                    <span className="font-semibold text-md">
                      {Object.values(questionStatuses).filter(s => 
                        s === "un-answered" || s === "review" || s === "not-visited"
                      ).length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-teal-400"></div>
                      <span className="font-semibold text-md">Marked for Review:</span>
                    </div>
                    <span className="font-semibold text-md">
                      {Object.values(questionStatuses).filter(s => 
                        s === "review" || s === "review-with-answer"
                      ).length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-700"></div>
                      <span className="font-semibold text-md">Not Visited:</span>
                    </div>
                    <span className="font-semibold text-md">
                      {Object.values(questionStatuses).filter(s => 
                        s === "not-visited"
                      ).length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-md">Total Questions:</span>
                    <span className="font-semibold text-md">
                      {quiz.questions.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-md">Time Remaining:</span>
                    <span className="font-semibold text-md">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  setShowSummaryDialog(false);
                  setShowSubmitDialog(true);
                }}
                className="bg-green-700 hover:bg-green-800"
              >
                Submit Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
