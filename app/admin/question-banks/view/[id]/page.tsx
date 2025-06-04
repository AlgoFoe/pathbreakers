"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, Book, Calendar, Check, Eye, EyeOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import QuestionBankService, { QuestionBankData } from "@/lib/services/questionBank.service";

interface ViewQuestionBankProps {
  params: {
    id: string;
  };
}

export default function ViewQuestionBank({ params }: ViewQuestionBankProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [questionBank, setQuestionBank] = useState<QuestionBankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);
  
  useEffect(() => {
    async function loadQuestionBank() {
      try {
        setLoading(true);
        const data = await QuestionBankService.getQuestionBankById(params.id, true);
        setQuestionBank(data);
      } catch (error) {
        console.error("Error loading question bank:", error);
        toast({
          title: "Error",
          description: "Failed to load question bank. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestionBank();
  }, [params.id, toast]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading question bank...</p>
        </div>
      </div>
    );
  }
  
  if (!questionBank) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Question Bank Not Found</h1>
        <p className="mb-6 text-muted-foreground">The question bank you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push("/admin/question-banks")}>Back to Question Banks</Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/question-banks")} className="mr-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Question Banks
          </Button>
          <h1 className="text-3xl font-bold">View Question Bank</h1>
        </div>
        
        <Button 
          onClick={() => router.push(`/admin/question-banks/edit/${params.id}`)} 
          variant="outline"
          className="flex items-center"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Question Bank
        </Button>
      </div>
      
      {/* Question Bank Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{questionBank.title}</CardTitle>
          {questionBank.description && (
            <CardDescription className="mt-2">{questionBank.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="outline" className="w-fit mt-1">{questionBank.category}</Badge>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={`w-fit mt-1 ${getStatusColor(questionBank.status)}`}>
                {questionBank.status.charAt(0).toUpperCase() + questionBank.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Questions</span>
              <span className="font-medium">{questionBank.questionsCount}</span>
            </div>
            
            {questionBank.subject && (
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Subject</span>
                <span className="font-medium">{questionBank.subject}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Book className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{questionBank.createdBy || "Admin"}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(questionBank.createdAt || '')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Questions List */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Questions ({questionBank.questions?.length || 0})</h2>
        
        <Button
          variant="outline"
          onClick={() => setShowAnswers(!showAnswers)}
          className="flex items-center"
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
      
      <ScrollArea className="h-[60vh]">
        <div className="space-y-6">
          {questionBank.questions?.map((question, index) => (
            <Card key={question.id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    Question {index + 1}
                  </CardTitle>
                  <Badge className={`${getDifficultyColor(question.difficulty || 'medium')}`}>
                    {(question.difficulty ?? 'Medium').charAt(0).toUpperCase() + (question.difficulty ?? 'Medium').slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-medium">{question.question}</p>
                </div>
                
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div 
                      key={option.id}
                      className={`p-3 rounded-md flex items-center ${
                        option.isCorrect && showAnswers
                        ? "bg-teal-100 border border-teal-300"
                        : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {option.isCorrect && showAnswers && (
                        <Check className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <span className={`font-medium mr-2`}>{option.id}:</span>
                        <span className={option.isCorrect && showAnswers ? "font-medium" : ""}>
                          {option.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Explanation: </span>{question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {(!questionBank.questions || questionBank.questions.length === 0) && (
            <div className="text-center p-6 bg-gray-50 rounded-md">
              <p className="text-muted-foreground">No questions available for this question bank.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
