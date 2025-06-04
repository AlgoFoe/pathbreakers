"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronLeft, ChevronRight, AlertCircle, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuizRevision {
  id: string;
  title: string;
  date: string;
  duration: number;
  questions: {
    id: number;
    question: string;
    options: {
      id: string;
      text: string;
      formula: string;
    }[];
    correctAnswer: string;
    selectedAnswer: string | null;
    isCorrect: boolean;
  }[];
}

export default function QuizRevisionPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuizRevision = async () => {
      try {
        const response = await fetch(`/api/quizzes/${params.quizId}/revision`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz revision data');
        }
        
        const data = await response.json();
        setQuizData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz revision:', error);
        setLoading(false);
      }
    };

    fetchQuizRevision();
  }, [params.quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:mt-0 mt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:mt-0 mt-16 flex flex-col justify-center items-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Quiz Not Found</h1>
        <p className="text-gray-600 mt-2">The quiz you are looking for doesn&apos;t exist or you have not attempted it.</p>
        <Button className="mt-6" variant="outline" onClick={() => router.push('/dashboard/quiz')}>
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:mt-0 mt-16">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{quizData.title} - Revision Mode</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(quizData.date)}
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                {quizData.duration} minutes
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard/quiz')}>
              Back to Quizzes
            </Button>
          </div>
        </header>

        <Card className="bg-white mb-6 p-6 shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </CardTitle>
          </CardHeader>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-800 mb-4">
                  {currentQuestion.question}
                </h2>
                
                <div className="space-y-3 mt-4">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-md border ${
                        option.id === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : option.id === currentQuestion.selectedAnswer && !currentQuestion.isCorrect
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            option.id === currentQuestion.correctAnswer
                              ? "bg-green-100 text-green-800"
                              : option.id === currentQuestion.selectedAnswer && !currentQuestion.isCorrect
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {option.id}
                        </div>
                        <div className="flex-1">{option.text}</div>
                        {option.id === currentQuestion.correctAnswer && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                        {option.id === currentQuestion.selectedAnswer && !currentQuestion.isCorrect && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation (placeholder for future enhancement) */}
              {currentQuestion.correctAnswer !== currentQuestion.selectedAnswer && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-1">Explanation</h3>
                  <p className="text-blue-700 text-sm">
                    The correct answer is option {currentQuestion.correctAnswer}.
                    {/* In the future, you could add detailed explanations for each question */}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
            
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
              variant="outline"
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-10 gap-2 mb-8">
          {quizData.questions.map((question, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                question.selectedAnswer
                  ? question.isCorrect
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-gray-500"
              } ${
                currentQuestionIndex === index ? "ring-2 ring-offset-2 ring-blue-400" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={() => router.push('/dashboard/quiz')} variant="default">
            Back to Quiz Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
