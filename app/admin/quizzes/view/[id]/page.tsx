"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizService, { QuizData } from "@/lib/services/quiz.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, Clock, Calendar, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ViewQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        const data = await QuizService.getQuizById(params.id);
        setQuiz(data);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuiz();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
        <p className="mb-6 text-muted-foreground">The quiz you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push("/admin/quizzes")}>Back to Quiz Management</Button>
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
      case "live":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "archived":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/quizzes")} className="mr-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
          <h1 className="text-3xl font-bold">View Quiz</h1>
        </div>
        
        <Button 
          onClick={() => router.push(`/admin/quizzes/edit/${params.id}`)} 
          variant="outline"
          className="flex items-center"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Quiz
        </Button>
      </div>

      {/* Quiz Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="outline" className="w-fit mt-1">{quiz.category}</Badge>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={`w-fit mt-1 ${getStatusColor(quiz.status)}`}>
                {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Questions</span>
              <span className="font-medium">{quiz.questionsCount}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{quiz.duration} minutes</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(quiz.createdAt)}</span>
            </div>
          </div>
          
          {quiz.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p>{quiz.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      <h2 className="text-xl font-bold mb-4">Questions ({quiz.questions?.length || 0})</h2>
      
      <ScrollArea className="h-[60vh]">
        <div className="space-y-6">
          {quiz.questions?.map((question, index) => (
            <Card key={index} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Question {index + 1}
                </CardTitle>
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
                        option.id === question.correctAnswer
                        ? "bg-teal-100 border border-teal-300"
                        : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {option.id === question.correctAnswer && (
                        <Check className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0" />
                      )}
                      <span className={option.id === question.correctAnswer ? "font-medium" : ""}>
                        {option.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!quiz.questions || quiz.questions.length === 0 && (
            <div className="text-center p-6 bg-gray-50 rounded-md">
              <p className="text-muted-foreground">No questions available for this quiz.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
