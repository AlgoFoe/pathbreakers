"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, PlusCircle, Edit, Trash2, MoreVertical,
  Clock, AlertCircle, Eye, FileQuestion, Book, BookOpen
} from "lucide-react";
import QuestionBankService, { QuestionBankData } from "@/lib/services/questionBank.service";
import { useToast } from "@/components/ui/use-toast";

export default function QuestionBanksAdmin() {
  const [questionBanks, setQuestionBanks] = useState<QuestionBankData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      setIsLoading(true);
      const data = await QuestionBankService.getQuestionBanks(true);
      setQuestionBanks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch question banks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestionBanks = questionBanks.filter(bank => {
    const matchesSearch = bank.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bank.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || bank.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(questionBanks.map(bank => bank.category)));

  const handlePublishQuestionBank = async (bankId: string | undefined) => {
    if (!bankId) return;
    
    try {
      await QuestionBankService.updateQuestionBankStatus(bankId, "published");
      toast({
        title: "Success",
        description: "Question bank published successfully",
        variant: "default"
      });
      setQuestionBanks(prevBanks => 
        prevBanks.map(bank => bank.id === bankId ? { ...bank, status: "published" } : bank)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish question bank",
        variant: "destructive"
      });
    }
  };

  const handleUnpublishQuestionBank = async (bankId: string | undefined) => {
    if (!bankId) return;
    
    try {
      await QuestionBankService.updateQuestionBankStatus(bankId, "draft");
      toast({
        title: "Success",
        description: "Question bank unpublished successfully",
        variant: "default"
      });
      setQuestionBanks(prevBanks => 
        prevBanks.map(bank => bank.id === bankId ? { ...bank, status: "draft" } : bank)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unpublish question bank",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestionBank = async (bankId: string | undefined) => {
    if (!bankId) return;
    
    if (confirm("Are you sure you want to delete this question bank? This action cannot be undone.")) {
      try {
        await QuestionBankService.deleteQuestionBank(bankId);
        toast({
          title: "Success",
          description: "Question bank deleted successfully",
          variant: "default"
        });
        setQuestionBanks(prevBanks => prevBanks.filter(bank => bank.id !== bankId));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete question bank",
          variant: "destructive"
        });
      }
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
          Question Bank Management
        </motion.h1>
        
        <Button asChild>
          <Link href="/admin/question-banks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Question Bank
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-1 max-w-sm items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search question banks..."
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
                    <SelectItem value="published">Published</SelectItem>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="text-muted-foreground">Loading question banks...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredQuestionBanks.length > 0 ? (
                    filteredQuestionBanks.map((bank) => (
                      <TableRow key={bank.id}>
                        <TableCell className="font-medium">{bank.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{bank.category}</Badge>
                        </TableCell>
                        <TableCell>{bank.questionsCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {bank.status === "published" ? (
                              <>
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span>Draft</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(bank.createdAt || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/question-banks/edit/${bank.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/question-banks/view/${bank.id}`}>
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
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {bank.status === "draft" ? (
                                  <DropdownMenuItem onClick={() => handlePublishQuestionBank(bank.id)}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUnpublishQuestionBank(bank.id)}>
                                    <Book className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteQuestionBank(bank.id)}>
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
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No question banks found matching your filters</p>
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
