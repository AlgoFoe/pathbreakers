"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save, PlusCircle, X, Trash2, Check, AlertCircle, FileQuestion } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QuestionBankService, { QuestionBankData, Question, QuestionOption } from "@/lib/services/questionBank.service";

export default function NewQuestionBank() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  const [formData, setFormData] = useState<Partial<QuestionBankData>>({
    title: "",
    description: "",
    category: "",
    subject: "",
    status: "draft",
    questionsCount: 0,
    questions: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    
    // Validate questions if there are any
    const questions = formData.questions || [];
    if (questions.length > 0) {
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
    }
    
    try {
      setIsSubmitting(true);
      
      // Update questions count
      const updatedData = {
        ...formData,
        questionsCount: (formData.questions || []).length
      };
      
      await QuestionBankService.createQuestionBank(updatedData as QuestionBankData);
      
      toast({
        title: "Success!",
        description: "Question bank created successfully.",
      });
      
      router.push("/admin/question-banks");
    } catch (error) {
      console.error("Error creating question bank:", error);
      toast({
        title: "Error",
        description: "Failed to create question bank. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/question-banks")} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Question Banks
        </Button>
        <h1 className="text-3xl font-bold">Create New Question Bank</h1>
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business-studies">Business Studies</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="psychology">Psychology</SelectItem>
                          <SelectItem value="accountancy">Accountancy</SelectItem>
                          <SelectItem value="applied-mathematics">Applied Mathematics</SelectItem>
                          <SelectItem value="economics">Economics</SelectItem>
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
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {formData.questions && formData.questions.length > 0 ? (
              <div className="space-y-8 mb-8">
                {formData.questions.map((question, index) => (
                  <Card key={question.id} className="relative">
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
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <RadioGroup
                                value={question.options.find(opt => opt.isCorrect)?.id || ""}
                                onValueChange={(value) => handleCorrectAnswerChange(question.id, value)}
                              >
                                <div className="flex items-center">
                                  <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                                  <Label htmlFor={`${question.id}-${option.id}`} className="sr-only">
                                    Correct answer for option {option.id}
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid gap-3">
                        <label className="text-sm font-medium">
                          Difficulty
                        </label>
                        <Select
                          value={question.difficulty}
                          onValueChange={(value) => handleQuestionChange(question.id, "difficulty", value)}
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
                      
                      <div className="grid gap-3">
                        <label className="text-sm font-medium">
                          Explanation (Optional)
                        </label>
                        <Textarea
                          value={question.explanation || ""}
                          onChange={(e) => handleQuestionChange(question.id, "explanation", e.target.value)}
                          placeholder="Enter explanation for the correct answer (optional)"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed mb-8">
                <FileQuestion className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="font-semibold text-xl mb-2">No questions added yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Add questions to your question bank. Each question can have multiple options, with one correct answer.
                </p>
                <Button onClick={handleAddQuestion}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </Card>
            )}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Question Bank
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
