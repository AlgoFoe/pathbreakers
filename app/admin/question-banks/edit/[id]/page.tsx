"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Save, PlusCircle, X, Trash2, Check, AlertCircle, FileQuestion } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QuestionBankService, { QuestionBankData, Question, QuestionOption } from "@/lib/services/questionBank.service";

interface EditQuestionBankProps {
  params: {
    id: string;
  };
}

export default function EditQuestionBank({ params }: EditQuestionBankProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [questionBank, setQuestionBank] = useState<QuestionBankData | null>(null);
  const [formData, setFormData] = useState<Partial<QuestionBankData>>({});
  
  useEffect(() => {
    async function loadQuestionBank() {
      try {
        setLoading(true);
        const data = await QuestionBankService.getQuestionBankById(params.id, true);
        setQuestionBank(data);
        setFormData(data);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      question: "",
      options: [
        { id: "A", text: "", isCorrect: true },
        { id: "B", text: "", isCorrect: false },
        { id: "C", text: "", isCorrect: false },
        { id: "D", text: "", isCorrect: false }
      ],
      difficulty: "medium"
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };
  
  const handleDeleteQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== id)
    }));
  };
  
  const handleQuestionChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };
  
  const handleOptionChange = (questionId: string, optionId: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map(opt => 
                opt.id === optionId ? { ...opt, text } : opt
              ) 
            } 
          : q
      )
    }));
  };
  
  const handleCorrectAnswerChange = (questionId: string, optionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map(opt => ({
                ...opt,
                isCorrect: opt.id === optionId
              }))
            } 
          : q
      )
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate questions
    const questions = formData.questions || [];
    const emptyQuestions = questions.filter(q => !q.question.trim());
    const emptyOptions = questions.filter(q => 
      q.options.some(opt => !opt.text.trim())
    );
    
    if (emptyQuestions.length > 0) {
      toast({
        title: "Empty questions",
        description: "Please fill in all question fields.",
        variant: "destructive"
      });
      setActiveTab("questions");
      return;
    }
    
    if (emptyOptions.length > 0) {
      toast({
        title: "Empty options",
        description: "Please fill in all option fields for each question.",
        variant: "destructive"
      });
      setActiveTab("questions");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update questions count
      const updatedData = {
        ...formData,
        questionsCount: (formData.questions || []).length
      };
      
      await QuestionBankService.updateQuestionBank(params.id, updatedData);
      
      toast({
        title: "Success!",
        description: "Question bank updated successfully.",
      });
      
      router.push("/admin/question-banks");
    } catch (error) {
      console.error("Error updating question bank:", error);
      toast({
        title: "Error",
        description: "Failed to update question bank. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
  
  const canEdit = questionBank.status !== "published";
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/question-banks")} className="mr-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Question Banks
          </Button>
          <h1 className="text-3xl font-bold">Edit Question Bank</h1>
        </div>
        
        {!canEdit && (
          <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">This published question bank is read-only. Unpublish it to make changes.</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Question Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="title"
                      placeholder="Enter title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      name="description"
                      placeholder="Enter description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <label className="text-sm font-medium">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                        required
                        disabled={!canEdit}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="math">Math</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="geography">Geography</SelectItem>
                          <SelectItem value="computer-science">Computer Science</SelectItem>
                          <SelectItem value="general-knowledge">General Knowledge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-3">
                      <label className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        name="subject"
                        placeholder="Enter subject (optional)"
                        value={formData.subject}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Questions ({formData.questions?.length || 0})</h2>
              
              <Button 
                type="button"
                onClick={handleAddQuestion}
                disabled={!canEdit}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            <div className="space-y-8">
              {formData.questions?.map((question, index) => (
                <Card key={question.id} className="relative">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Delete question</span>
                    </Button>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3">
                      <label className="text-sm font-medium">
                        Question <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => handleQuestionChange(question.id, "question", e.target.value)}
                        placeholder="Enter question"
                        rows={2}
                        disabled={!canEdit}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Options</label>
                        <label className="text-sm font-medium">Correct Answer</label>
                      </div>
                      
                      {question.options.map((option) => (
                        <div key={option.id} className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1 flex justify-center">
                            <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-medium">
                              {option.id}
                            </div>
                          </div>
                          <div className="col-span-9">
                            <Input
                              value={option.text}
                              onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                              placeholder={`Option ${option.id}`}
                              disabled={!canEdit}
                            />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <RadioGroup className="flex">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={option.id} 
                                  id={`option-${question.id}-${option.id}`}
                                  checked={option.isCorrect}
                                  onClick={() => canEdit && handleCorrectAnswerChange(question.id, option.id)}
                                  disabled={!canEdit}
                                />
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid gap-3">
                      <label className="text-sm font-medium">Explanation (Optional)</label>
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) => handleQuestionChange(question.id, "explanation", e.target.value)}
                        placeholder="Explain the correct answer"
                        rows={2}
                        disabled={!canEdit}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <label className="text-sm font-medium">Difficulty</label>
                        <Select
                          value={question.difficulty}
                          onValueChange={(value) => handleQuestionChange(question.id, "difficulty", value)}
                          disabled={!canEdit}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!formData.questions || formData.questions.length === 0) && (
                <div className="text-center p-12 border border-dashed rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <FileQuestion className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No questions added yet</p>
                    {canEdit && (
                      <Button onClick={handleAddQuestion}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add First Question
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/question-banks")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {canEdit && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
