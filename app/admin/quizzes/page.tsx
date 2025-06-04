"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import QuizService, { QuizData } from "@/lib/services/quiz.service";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Edit,
  Eye,
  MoreVertical,
  PlusCircle,
  Search,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function QuizzesAdmin() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await QuizService.getQuizzes();
        console.log("Fetched quizzes:", data);
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    }
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || quiz.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || quiz.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });
  const categories = Array.from(new Set(quizzes.map(quiz => quiz.category)));

  const handleDeactivateQuiz = async (quizId: string | undefined) => {
    if (!quizId) {
      console.error("Quiz ID is undefined");
      return;
    }
    try {
      await QuizService.updateQuizStatus(quizId, "archived");
      alert("Quiz deactivated successfully!");
      setQuizzes((prevQuizzes) => prevQuizzes.map((quiz) => quiz.id === quizId ? { ...quiz, status: "archived" } : quiz));
    } catch (error) {
      console.error("Failed to deactivate quiz:", error);
    }
  };

  const handleActivateQuiz = async (quizId: string | undefined) => {
    if (!quizId) {
      console.error("Quiz ID is undefined");
      return;
    }
    try {
      await QuizService.updateQuizStatus(quizId, "live");
      alert("Quiz activated successfully!");
      setQuizzes((prevQuizzes) => prevQuizzes.map((quiz) => quiz.id === quizId ? { ...quiz, status: "live" } : quiz));
    } catch (error) {
      console.error("Failed to activate quiz:", error);
    }
  };

  const handleDeleteQuiz = async (quizId: string | undefined) => {
    if (!quizId) {
      console.error("Quiz ID is undefined");
      return;
    }
    try {
      await QuizService.deleteQuiz(quizId);
      alert("Quiz deleted successfully!");
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold"
        >
          Quiz Management
        </motion.h1>
        
        <Button asChild>
          <Link href="/admin/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-1 max-w-sm items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category, index) => (
                      <SelectItem key={`${category}-${index}`} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Time (min)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.length > 0 ? (
                    filteredQuizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">{quiz.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{quiz.category}</Badge>
                        </TableCell>
                        <TableCell>{quiz.questionsCount}</TableCell>
                        <TableCell>{quiz.duration}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {quiz.status === "live" ? (
                              <>
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span>Draft</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(quiz.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/quizzes/edit/${quiz.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/quizzes/view/${quiz.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>                              <DropdownMenuContent align="end">
                                {quiz.status === "archived" ? (
                                  <DropdownMenuItem onClick={() => handleActivateQuiz(quiz.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleDeactivateQuiz(quiz.id)}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No quizzes found matching your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
