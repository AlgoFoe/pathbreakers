"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  BookOpen,
  Bookmark,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import QuestionBankService, { QuestionBankData, Question } from "@/lib/services/questionBank.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuestionBankDetailProps {
  params: {
    id: string;
  };
}

export default function QuestionBankDetail({ params }: QuestionBankDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [questionBank, setQuestionBank] = useState<QuestionBankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'single'>('list');
  
  useEffect(() => {
    async function loadQuestionBank() {
      try {
        setLoading(true);
        const data = await QuestionBankService.getQuestionBankById(params.id, false);
        setQuestionBank(data);
      } catch (error) {
        console.error("Error loading question bank:", error);
        toast({
          title: "Error",
          description: "Failed to load question bank. Please try again.",
          variant: "destructive"
        });
        router.push("/dashboard/question-banks");
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestionBank();
  }, [params.id, toast, router]);
  
  const handleNextQuestion = () => {
    if (questionBank?.questions && currentQuestionIndex < questionBank.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const getCurrentQuestion = (): Question | null => {
    if (!questionBank?.questions) return null;
    return questionBank.questions[currentQuestionIndex] || null;
  };
  
  const currentQuestion = getCurrentQuestion();
    if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-6xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading question bank...</p>
        </div>
      </div>
    );
  }
    if (!questionBank) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-6xl text-center min-h-[60vh]">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Question Bank Not Found</h2>
          <p className="mb-8 text-muted-foreground">
            The question bank you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Button onClick={() => router.push("/dashboard/question-banks")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Question Banks
          </Button>
        </div>
      </div>
    );
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
    return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-black">
        <div>
          <h1 className="text-2xl font-bold">{questionBank.title}</h1>
          {questionBank.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{questionBank.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200">
            <BookOpen className="mr-2 h-4 w-4" />
            {questionBank.category}
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200">
            <Bookmark className="mr-2 h-4 w-4" />
            {questionBank.questionsCount} Questions
          </Badge>
        </div>
      </div>
        <Tabs defaultValue="list" value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'single')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="list" className="data-[state=active]:bg-black data-[state=active]:text-white">List View</TabsTrigger>
            <TabsTrigger value="single" className="data-[state=active]:bg-black data-[state=active]:text-white">Single Question</TabsTrigger>
          </TabsList>
            <Button
            variant="outline"
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200"
          >
            {showAnswers ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Answers
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Answers
              </>
            )}
          </Button>
        </div>
          <TabsContent value="list">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-8">
                  {questionBank.questions?.map((question, index) => (
                    <div key={question.id} className="pb-6 border-b last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                        {question.difficulty && (
                          <Badge className={`${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="mb-4">{question.question}</p>
                        <div className="space-y-3">
                        {question.options.map((option) => (
                          <div 
                            key={option.id}
                            className={`p-3 rounded-md ${
                              option.isCorrect && showAnswers
                                ? "bg-teal-100 border border-teal-300"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <div className="flex items-center justify-center w-6 h-6 border rounded-full shadow-sm bg-white">
                                  {option.id}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className={option.isCorrect && showAnswers ? "font-medium" : ""}>
                                  {option.text}
                                </p>
                                
                                {option.isCorrect && showAnswers && (
                                  <div className="flex items-center mt-2 text-teal-600 text-sm font-medium">
                                    <Check className="h-4 w-4 mr-1" />
                                    <span>Correct Answer</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                          {showAnswers && question.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Explanation: </span>
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
          <TabsContent value="single">
          <Card className="mb-6 bg-white shadow-sm">
            <CardContent className="p-6">
              {currentQuestion ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-lg">Question {currentQuestionIndex + 1} of {questionBank.questions?.length}</h3>
                      {currentQuestion.difficulty && (
                        <Badge className={`ml-3 ${getDifficultyColor(currentQuestion.difficulty)}`}>
                          {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[60vh] flex flex-col"
                  >
                    <div className="mb-6">
                      <p className="text-xl font-medium mb-8">{currentQuestion.question}</p>
                        <div className="space-y-4">
                        {currentQuestion.options.map((option) => (
                          <div 
                            key={option.id}
                            className={`p-4 rounded-md ${
                              option.isCorrect && showAnswers
                                ? "bg-teal-100 border border-teal-300"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-4">
                                <div className="flex items-center justify-center w-8 h-8 border rounded-full bg-white shadow-sm">
                                  {option.id}
                                </div>
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={option.isCorrect && showAnswers ? "font-medium" : ""}>
                                  {option.text}
                                </p>
                              </div>
                              {option.isCorrect && showAnswers && (
                                <div className="ml-2 text-teal-600">
                                  <Check className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {showAnswers && currentQuestion.explanation && (
                      <div className="mt-auto p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-800">
                          <span className="font-medium">Explanation: </span>
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No questions available in this question bank.</p>
                </div>
              )}
            </CardContent>
          </Card>
            <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-100 hover:bg-gray-200 text-black"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Question
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={!questionBank.questions || currentQuestionIndex >= questionBank.questions.length - 1}
              className="bg-gray-100 hover:bg-gray-200 text-black"
            >
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
