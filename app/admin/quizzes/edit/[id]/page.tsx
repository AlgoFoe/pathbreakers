"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizService, { QuizData, QuizQuestion } from "@/lib/services/quiz.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, Save, PlusCircle, Trash2, Check } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export default function EditQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        const data = await QuizService.getQuizById(params.id);
        
        // Quiz can only be edited if it's deactivated/archived
        if (data.status !== "archived") {
          toast({
            title: "Cannot Edit Quiz",
            description: "Only deactivated quizzes can be edited. Please deactivate the quiz first.",
            variant: "destructive",
          });
          setCanEdit(false);
        } else {
          setCanEdit(true);
        }
        
        setQuiz(data);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        toast({
          title: "Error",
          description: "Failed to load quiz details.",
          variant: "destructive",
        });
        router.push("/admin/quizzes");
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuiz();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      await QuizService.updateQuiz(params.id, quiz);
      toast({
        title: "Success",
        description: "Quiz updated successfully.",
      });
      router.push("/admin/quizzes");
    } catch (error) {
      console.error("Failed to update quiz:", error);
      toast({
        title: "Error",
        description: "Failed to update quiz.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    if (!quiz) return;
    
    const newQuestion: QuizQuestion = {
      id: quiz.questions ? quiz.questions.length + 1 : 1,
      question: "",
      options: [
        { id: uuidv4(), text: "" },
        { id: uuidv4(), text: "" },
        { id: uuidv4(), text: "" },
        { id: uuidv4(), text: "" }
      ],
      correctAnswer: ""
    };

    setQuiz({
      ...quiz,
      questions: [...(quiz.questions || []), newQuestion],
      questionsCount: (quiz.questionsCount || 0) + 1
    });
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    if (!quiz || !quiz.questions) return;

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };

    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    if (!quiz || !quiz.questions) return;

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = text;

    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const setCorrectAnswer = (questionIndex: number, optionId: string) => {
    if (!quiz || !quiz.questions) return;

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].correctAnswer = optionId;

    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (index: number) => {
    if (!quiz || !quiz.questions) return;

    const updatedQuestions = quiz.questions.filter((_, i) => i !== index).map((q, i) => ({
      ...q,
      id: i + 1
    }));

    setQuiz({
      ...quiz,
      questions: updatedQuestions,
      questionsCount: updatedQuestions.length
    });
  };

  const addOption = (questionIndex: number) => {
    if (!quiz || !quiz.questions) return;
    if (quiz.questions[questionIndex].options.length >= 6) return; // Limit options to 6

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options.push({
      id: uuidv4(),
      text: ""
    });

    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (!quiz || !quiz.questions) return;
    if (quiz.questions[questionIndex].options.length <= 2) return; // Minimum 2 options

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);

    // If the correct answer was removed, reset it
    const correctOption = updatedQuestions[questionIndex].correctAnswer;
    if (correctOption === updatedQuestions[questionIndex].options[optionIndex]?.id) {
      updatedQuestions[questionIndex].correctAnswer = "";
    }

    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => router.push("/admin/quizzes")} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <h1 className="text-3xl font-bold">Edit Quiz</h1>
      </div>

      {!canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-500">Quiz Cannot Be Edited</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">This quiz cannot be edited because it is not deactivated. Please deactivate the quiz first from the quiz management page.</p>
            <Button onClick={() => router.push("/admin/quizzes")}>Back to Quiz Management</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Quiz Details</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        value={quiz.title}
                        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={quiz.category} 
                        onValueChange={(value) => setQuiz({ ...quiz, category: value })}
                      >
                        <SelectTrigger id="category" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUET">CUET</SelectItem>
                          <SelectItem value="JEE">JEE</SelectItem>
                          <SelectItem value="NEET">NEET</SelectItem>
                          <SelectItem value="UPSC">UPSC</SelectItem>
                          <SelectItem value="SSC">SSC</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the quiz"
                      value={quiz.description || ""}
                      onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time">Time Limit (minutes)</Label>
                      <Input
                        id="time"
                        type="number"
                        value={quiz.duration}
                        onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value) })}
                        className="mt-1"
                        min={1}
                      />
                    </div>

                    <div>
                      <Label htmlFor="questionsCount">Number of Questions</Label>
                      <Input
                        id="questionsCount"
                        type="number" 
                        value={quiz.questionsCount || 0}
                        className="mt-1"
                        min={0}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Go to Questions tab to add or edit questions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Questions
                  <span className="ml-2 text-sm text-muted-foreground font-normal">
                    ({quiz.questions?.length || 0} total)
                  </span>
                </h2>
                <Button onClick={addQuestion}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
              
              <div className="space-y-6">
                {quiz.questions?.length === 0 || !quiz.questions ? (
                  <Card className="border-dashed border-2 p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <PlusCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">No Questions Yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        Start creating your quiz by adding questions. Each question needs a correct answer.
                      </p>
                      <Button onClick={addQuestion}>
                        Add First Question
                      </Button>
                    </div>
                  </Card>
                ) : (
                  quiz.questions?.map((question, qIndex) => (
                    <Card key={qIndex} className="mb-4">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                          <Textarea
                            id={`question-${qIndex}`}
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                            className="mt-1"
                            rows={2}
                            placeholder="Enter your question here..."
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Options</Label>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addOption(qIndex)}
                              disabled={question.options.length >= 6}
                            >
                              <PlusCircle className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          
                          <RadioGroup 
                            className="space-y-2"
                            value={question.correctAnswer}
                            onValueChange={(value) => setCorrectAnswer(qIndex, value)}
                          >
                            {question.options.map((option, oIndex) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={`option-${qIndex}-${oIndex}`} />
                                <div className="flex-1">
                                  <Input
                                    value={option.text}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                </div>
                                {question.options.length > 2 && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                          
                          {!question.correctAnswer && (
                            <p className="text-amber-500 text-sm mt-2">
                              Please select a correct answer for this question
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              {(quiz.questions?.length || 0) > 0 && (
                <Button onClick={addQuestion} variant="outline" className="mt-6">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Another Question
                </Button>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-4 mt-8">
            <Button variant="outline" onClick={() => router.push("/admin/quizzes")}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={
                isSubmitting || 
                !quiz.title || 
                !quiz.questions?.length || 
                quiz.questions.some(q => !q.question || !q.correctAnswer)
              } 
              className="flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
