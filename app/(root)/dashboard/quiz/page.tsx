"use client";

import QuizCard from "@/components/quiz/QuizCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { fetchAttemptedQuizzes, fetchQuizzes } from "@/lib/quiz-api";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Calendar, Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";

// Quiz type definition
export type Quiz = {
  id: string;
  title: string;
  date: string;
  duration: string;
  questionsCount: number;
  syllabus: string[];
  status: "upcoming" | "live" | "attempted" | "missed";
  score?: number;
  totalMarks?: number;
};

export default function QuizDashboardPage() {  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();  
  
  // Helper function to determine quiz status - improved logic based on date and attempts
  const determineQuizStatus = (quiz: any, attemptedQuizIds: string[] = []) => {
    // First check if the quiz has been attempted by the user
    // This overrides any other status determination
    if (attemptedQuizIds && Array.isArray(attemptedQuizIds) && attemptedQuizIds.includes(quiz.id)) {
      return "attempted";
    }
    
    // Respect the status from the database first
    // This enables admin control over the quiz status
    if (quiz.status === "live") {
      return "live";
    }
    
    // Get the current date/time
    const now = new Date();
    
    // Get the quiz date and calculate end time (date + duration)
    const quizDate = new Date(quiz.date);
    const quizEndTime = new Date(quizDate.getTime() + (quiz.duration * 60000)); // Add duration in minutes
    
    // Quiz is live if current time falls between start and end times
    if (now >= quizDate && now <= quizEndTime) {
      return "live";
    }
      // Quiz is missed if end time has passed and it wasn't attempted
    if (quizEndTime < now) {
      return "missed";
    }
    
    // Otherwise, it's upcoming
    return "upcoming";
  };
  
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        // Fetch quizzes first - this is the most important data
        const fetchedQuizzesData = await fetchQuizzes();
        
        // For testing - log what we got from the API
        console.log("Fetched quizzes:", fetchedQuizzesData);
        
        if (!Array.isArray(fetchedQuizzesData)) {
          console.error("Invalid data format returned from API:", fetchedQuizzesData);
          throw new Error("Invalid data format returned from API");
        }
          let attemptedQuizzes = [];
        try {
          // Try to fetch attempted quizzes, but continue if it fails
          attemptedQuizzes = await fetchAttemptedQuizzes();
          console.log("Fetched attempted quizzes:", attemptedQuizzes);
        } catch (attemptsError) {
          console.warn("Failed to fetch attempts, continuing with empty array:", attemptsError);
        }
        
        // Extract just the IDs for status determination
        const attemptedQuizIds = attemptedQuizzes.map((attempt: any) => attempt.quizId);
        
        // Create a map for quick lookup of quiz scores
        const attemptedQuizMap = new Map();
        attemptedQuizzes.forEach((attempt: any) => {
          attemptedQuizMap.set(attempt.quizId, {
            score: attempt.score,
            totalMarks: attempt.totalMarks
          });
        });
        
        // Process quizzes to determine status based on current date and user attempts
        const processedQuizzes = fetchedQuizzesData.map((quiz: any) => {
          const status = determineQuizStatus(quiz, attemptedQuizIds);
          console.log(`Quiz ${quiz.id} (${quiz.title}) determined status: ${status}`);
          
          // Add score information if this quiz was attempted
          let quizWithScore = {
            ...quiz,
            duration: `${quiz.duration} minutes`,
            status: status
          };
          
          if (status === "attempted" && attemptedQuizMap.has(quiz.id)) {
            const attemptData = attemptedQuizMap.get(quiz.id);
            quizWithScore.score = attemptData.score;
            quizWithScore.totalMarks = attemptData.totalMarks;
          }
          
          return quizWithScore;
        });
        
        // Debug log showing all quizzes by status
        console.log("Quizzes by status:", {
          all: processedQuizzes.length,
          live: processedQuizzes.filter(q => q.status === "live").length,
          upcoming: processedQuizzes.filter(q => q.status === "upcoming").length,
          attempted: processedQuizzes.filter(q => q.status === "attempted").length,
          missed: processedQuizzes.filter(q => q.status === "missed").length,
        });
        
        setQuizzes(processedQuizzes);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quizzes. Please try again later.",
        });
        setLoading(false);
      }
    };
    
    loadQuizzes();
  }, [toast]);

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-8 lg:mt-0 mt-2 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8 flex flex-wrap justify-between">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="live">Live Now</TabsTrigger>
            <TabsTrigger value="attempted">Attempted</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>                <TabsContent value="all" className="mt-0">
                  {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-600">No quizzes available</h3>
                      <p className="text-gray-500 mt-2">Check back later for new quizzes</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                  <TabsContent value="upcoming" className="mt-0">
                  {quizzes.filter(quiz => quiz.status === "upcoming").length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-600">No upcoming quizzes</h3>
                      <p className="text-gray-500 mt-2">Check back later for new quizzes</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes
                        .filter((quiz) => quiz.status === "upcoming")
                        .map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                  )}
                </TabsContent>
                  <TabsContent value="live" className="mt-0">
                  {quizzes.filter(quiz => quiz.status === "live").length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Clock className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-600">No live quizzes</h3>
                      <p className="text-gray-500 mt-2">There are currently no active quizzes</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes
                        .filter((quiz) => quiz.status === "live")
                        .map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                  )}
                </TabsContent>
                  <TabsContent value="attempted" className="mt-0">
                  {quizzes.filter(quiz => quiz.status === "attempted").length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Check className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-600">No attempted quizzes</h3>
                      <p className="text-gray-500 mt-2">You haven&apos;t attempted any quizzes yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes
                        .filter((quiz) => quiz.status === "attempted")
                        .map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                  )}
                </TabsContent>
                  <TabsContent value="missed" className="mt-0">
                  {quizzes.filter(quiz => quiz.status === "missed").length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-600">No missed quizzes</h3>
                      <p className="text-gray-500 mt-2">You haven&apos;t missed any quizzes</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes
                        .filter((quiz) => quiz.status === "missed")
                        .map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
