"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import QuizService from "@/lib/services/quiz.service";
import { toast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ChevronLeft, Save, Eye, Trash2, PlusCircle, 
  GripVertical, Clock, Settings
} from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';

// Define types for questions
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  type: "single" | "multiple";
  explanation?: string;
  marks: number;
}

export default function QuizEditor({ params }: { params?: { id: string } }) {
  const router = useRouter();
  const isEditing = !!params?.id;
  
  // Form state
  const [title, setTitle] = useState(isEditing ? "CUET General Test - Set 1" : "");
  const [category, setCategory] = useState(isEditing ? "CUET" : "");
  const [description, setDescription] = useState(isEditing 
    ? "Practice test for Common University Entrance Test preparation" 
    : ""
  );
  const [timeLimit, setTimeLimit] = useState(isEditing ? "60" : "30");
  const [passingPercentage, setPassingPercentage] = useState(isEditing ? "40" : "33");
  const [showAnswers, setShowAnswers] = useState(true);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>(
    isEditing 
      ? [
          {
            id: "q1",
            text: "What is the capital of India?",
            options: [
              { id: "o1", text: "New Delhi", isCorrect: true },
              { id: "o2", text: "Mumbai", isCorrect: false },
              { id: "o3", text: "Kolkata", isCorrect: false },
              { id: "o4", text: "Chennai", isCorrect: false },
            ],
            type: "single",
            explanation: "New Delhi is the capital city of India.",
            marks: 1
          },
          {
            id: "q2",
            text: "Which of these rivers flow in India?",
            options: [
              { id: "o5", text: "Ganga", isCorrect: true },
              { id: "o6", text: "Yamuna", isCorrect: true },
              { id: "o7", text: "Amazon", isCorrect: false },
              { id: "o8", text: "Nile", isCorrect: false },
            ],
            type: "multiple",
            explanation: "Ganga and Yamuna are rivers in India.",
            marks: 2
          },
          {
            id: "q3",
            text: "What is the value of π (pi) to two decimal places?",
            options: [
              { id: "o9", text: "3.14", isCorrect: true },
              { id: "o10", text: "3.15", isCorrect: false },
              { id: "o11", text: "3.16", isCorrect: false },
              { id: "o12", text: "3.17", isCorrect: false },
            ],
            type: "single",
            marks: 1
          },
        ]
      : []
  );

  // Handle drag and drop reordering
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setQuestions(items);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      text: "",
      options: [
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
      ],
      type: "single",
      marks: 1
    };
    
    setQuestions([...questions, newQuestion]);
  };

  // Remove a question
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update question text
  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text } : q
    ));
  };

  // Update question type
  const updateQuestionType = (id: string, type: "single" | "multiple") => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, type } : q
    ));
  };
  
  // Update mark value
  const updateQuestionMarks = (id: string, marks: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, marks } : q
    ));
  };

  // Update explanation
  const updateExplanation = (id: string, explanation: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, explanation } : q
    ));
  };

  // Update option text
  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(o => 
              o.id === optionId ? { ...o, text } : o
            ) 
          } 
        : q
    ));
  };

  // Update option correctness
  const updateOptionCorrectness = (questionId: string, optionId: string, isCorrect: boolean) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      
      // For single choice questions, deselect all other options
      if (isCorrect && q.type === "single") {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, isCorrect: true } : { ...o, isCorrect: false }
          )
        };
      } 
      
      // For multiple choice questions
      return {
        ...q,
        options: q.options.map(o => 
          o.id === optionId ? { ...o, isCorrect } : o
        )
      };
    }));
  };

  // Add an option to a question
  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: [...q.options, { id: uuidv4(), text: "", isCorrect: false }]
          } 
        : q
    ));
  };

  // Remove an option
  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.filter(o => o.id !== optionId)
          } 
        : q
    ));
  };  // Save quiz
  const handleSave = async (isDraft: boolean = false) => {
    console.log("Saving quiz with data:", {
      title,
      category,
      description,
      timeLimit,
      passingPercentage,
      showAnswers,
      randomizeQuestions,
      randomizeOptions,
      isDraft,
      questions
    });
    setIsSubmitting(true);

    try {
      // Validation
      if (!title.trim()) {
        toast({ title: "Error", description: "Quiz title is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      if (questions.length === 0) {
        toast({ title: "Error", description: "Quiz must have at least one question", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      try {
        // Validate that each question has text and at least one correct answer
        for (const q of questions) {
          if (!q.text.trim()) {
            toast({ title: "Error", description: "All questions must have text", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          if (q.options.filter(o => o.isCorrect).length === 0) {
            toast({ title: "Error", description: `Question \"${q.text.substring(0, 30)}...\" must have at least one correct answer`, variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          for (const o of q.options) {
            if (!o.text.trim()) {
              toast({ title: "Error", description: `All options for question \"${q.text.substring(0, 30)}...\" must have text`, variant: "destructive" });
              setIsSubmitting(false);
              return;
            }
          }
        }
      } catch (validationError) {
        console.error("Error in question validation:", validationError);
        toast({
          title: "Error",
          description: "Failed to validate questions. Please check your quiz content.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        // Format the quiz data for the API
        const formattedQuestions = questions.map((q, index) => {
          console.log(`Processing question ${index + 1}:`, q.text.substring(0, 20));
          const correctOptions = q.options.filter(o => o.isCorrect);
          console.log(`Found ${correctOptions.length} correct options`);
          
          const correctAnswer = q.type === "single" 
            ? correctOptions[0].id 
            : correctOptions.map(o => o.id).join(',');

          return {
            id: index + 1,
            question: q.text,
            options: q.options.map(o => ({
              id: o.id,
              text: o.text,
            })),
            correctAnswer,
          };
        });
        
        const quizData = {
          id: isEditing ? params?.id : undefined,
          title,
          category,
          date: new Date(),
          duration: parseInt(timeLimit),
          questionsCount: questions.length,
          syllabus: category.split(',').map(item => item.trim()),
          status: isDraft ? "upcoming" : "live" as "upcoming" | "live" | "archived",
          questions: formattedQuestions,
          time: parseInt(timeLimit),
          createdAt: new Date().toISOString(),
        };

        console.log("About to save quiz, isEditing:", isEditing);
        
        if (isEditing) {
          console.log("Updating existing quiz with ID:", params!.id);
          await QuizService.updateQuiz(params!.id, quizData);
        } else {
          console.log("Creating new quiz with data:", quizData);
          try {
            const result = await QuizService.createQuiz(quizData);
            console.log("Quiz creation result:", result);
          } catch (apiError) {
            console.error("API error during quiz creation:", apiError);
            throw new Error(`Quiz API error: ${apiError instanceof Error ? apiError.message : "Unknown error"}`);
          }
        }
        
        toast({
          title: isDraft ? "Quiz saved as draft" : "Quiz published",
          description: isDraft ? "Your quiz has been saved as a draft" : "Your quiz has been published successfully",
        });
        
        console.log("Quiz saved successfully, redirecting to quiz list page");
        router.push("/admin/quizzes");
      } catch (formattingError) {
        console.error("Error formatting quiz data:", formattingError);
        toast({
          title: "Error",
          description: "Failed to format quiz data. Please check your content.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: `Failed to save quiz: ${error instanceof Error ? error.message : "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex items-center"
      >
        <Button variant="ghost" onClick={() => router.push("/admin/quizzes")} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit Quiz" : "Create New Quiz"}</h1>
      </motion.div>
      
      <Tabs defaultValue="questions">
        <TabsList className="mb-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-6">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Questions 
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                ({questions.length} total)
              </span>
            </h2>
            <Button onClick={addQuestion}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
          
          {questions.length === 0 ? (
            <Card className="border-dashed border-2 p-8 text-center bg-background">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <PlusCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">No Questions Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Start creating your quiz by adding questions. Each question can have multiple options 
                  with one or more correct answers.
                </p>
                <Button onClick={addQuestion}>
                  Add First Question
                </Button>
              </div>
            </Card>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-card"
                          >
                            <CardContent className="p-0">
                              <div className="flex items-center gap-2 p-4 border-b bg-muted/40">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab p-1 hover:bg-muted rounded"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium">Question {index + 1}</span>
                                <div className="ml-auto flex items-center gap-2">
                                  <Select 
                                    value={question.type} 
                                    onValueChange={(val) => updateQuestionType(question.id, val as "single" | "multiple")}
                                  >
                                    <SelectTrigger className="h-8 w-44">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="single">Single Choice</SelectItem>
                                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeQuestion(question.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="p-4 space-y-4">
                                <div>
                                  <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                                  <Textarea
                                    id={`question-${question.id}`}
                                    placeholder="Enter question text"
                                    value={question.text}
                                    onChange={(e) => updateQuestionText(question.id, e.target.value)}
                                    className="mt-1 resize-none"
                                    rows={2}
                                  />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Label>Options</Label>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Label htmlFor={`marks-${question.id}`} className="text-sm whitespace-nowrap">
                                          Marks:
                                        </Label>
                                        <Select 
                                          value={question.marks.toString()} 
                                          onValueChange={(val) => updateQuestionMarks(question.id, parseInt(val))}
                                        >
                                          <SelectTrigger id={`marks-${question.id}`} className="h-8 w-20">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => addOption(question.id)}
                                        disabled={question.options.length >= 8}
                                      >
                                        <PlusCircle className="h-3 w-3 mr-1" />
                                        Add Option
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {question.options.map((option, optIndex) => (
                                      <div key={option.id} className="flex items-center gap-2">
                                        {question.type === "single" ? (
                                          <RadioGroup value={option.isCorrect ? option.id : ""} className="flex-1">
                                            <div className="flex items-center space-x-2">
                                              <RadioGroupItem
                                                value={option.id}
                                                id={`option-${option.id}`}
                                                checked={option.isCorrect}
                                                onClick={() => updateOptionCorrectness(question.id, option.id, !option.isCorrect)}
                                              />
                                              <Input
                                                placeholder={`Option ${optIndex + 1}`}
                                                value={option.text}
                                                onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                                className="flex-1"
                                              />
                                            </div>
                                          </RadioGroup>
                                        ) : (
                                          <div className="flex items-center space-x-2 flex-1">
                                            <input
                                              type="checkbox"
                                              id={`option-${option.id}`}
                                              checked={option.isCorrect}
                                              onChange={() => updateOptionCorrectness(question.id, option.id, !option.isCorrect)}
                                              className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Input
                                              placeholder={`Option ${optIndex + 1}`}
                                              value={option.text}
                                              onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                              className="flex-1"
                                            />
                                          </div>
                                        )}
                                        
                                        {question.options.length > 2 && (
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => removeOption(question.id, option.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <Accordion type="single" className="w-full">
                                  <AccordionItem value="explanation">
                                    <AccordionTrigger className="py-2 text-sm">
                                      Answer Explanation (Optional)
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <Textarea
                                        placeholder="Explain why the correct answer(s) are correct"
                                        value={question.explanation || ""}
                                        onChange={(e) => updateExplanation(question.id, e.target.value)}
                                        className="resize-none"
                                        rows={3}
                                      />
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          
          <div className="mt-6">
            <Button onClick={addQuestion} variant="outline" className="mr-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Question
            </Button>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-8">
            <Button variant="outline" onClick={() => handleSave(true)}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(false)}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Publishing..." : "Publish Quiz"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="text-muted-foreground h-5 w-5" />
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set to 0 for no time limit
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="passingPercentage">Passing Percentage</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Settings className="text-muted-foreground h-5 w-5" />
                    <Input
                      id="passingPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={passingPercentage}
                      onChange={(e) => setPassingPercentage(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum percentage needed to pass the quiz
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAnswers" className="text-base">Show Answers After Completion</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to see correct answers after finishing the quiz
                    </p>
                  </div>
                  <Switch 
                    id="showAnswers" 
                    checked={showAnswers}
                    onCheckedChange={setShowAnswers}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="randomizeQuestions" className="text-base">Randomize Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show questions in a random order for each attempt
                    </p>
                  </div>
                  <Switch 
                    id="randomizeQuestions" 
                    checked={randomizeQuestions}
                    onCheckedChange={setRandomizeQuestions}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="randomizeOptions" className="text-base">Randomize Answer Options</Label>
                    <p className="text-sm text-muted-foreground">
                      Display answer options in random order
                    </p>
                  </div>
                  <Switch 
                    id="randomizeOptions" 
                    checked={randomizeOptions}
                    onCheckedChange={setRandomizeOptions}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic" className="text-base">Public Quiz</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this quiz available to all users
                    </p>
                  </div>
                  <Switch 
                    id="isPublic" 
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-8">
                <Button variant="outline" onClick={() => handleSave(true)}>
                  Save as Draft
                </Button>
                <Button onClick={() => handleSave(false)}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Publishing..." : "Publish Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
