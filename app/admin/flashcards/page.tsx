"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, PlusCircle, Edit, Trash2, MoreVertical, 
  Eye, AlertCircle, BookOpen, Copy, Loader2
} from "lucide-react";

interface FlashcardSet {
  _id: string;
  title: string;
  description?: string;
  flashcards: Array<{
    question: string;
    answer: string;
    difficulty: string;
  }>;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FlashcardsAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchFlashcardSets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("query", searchQuery);
      }

      const response = await fetch(`/api/admin/flashcard-sets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch flashcard sets');
      }

      const result = await response.json();
      if (result.success) {
        setFlashcardSets(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch flashcard sets');
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast({
        title: "Error",
        description: "Failed to load flashcard sets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, toast]);

  // Fetch flashcard sets
  useEffect(() => {
    fetchFlashcardSets();
  }, [fetchFlashcardSets]);
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this flashcard set?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/flashcard-sets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard set');
      }

      toast({
        title: "Success",
        description: "Flashcard set deleted successfully.",
      });

      // Refresh the list
      fetchFlashcardSets();
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard set. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/flashcard-sets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard set');
      }

      toast({
        title: "Success",
        description: `Flashcard set ${!currentStatus ? 'published' : 'unpublished'} successfully.`,
      });

      // Refresh the list
      fetchFlashcardSets();
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      toast({
        title: "Error",
        description: "Failed to update flashcard set. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const filteredFlashcards = flashcardSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && set.published) ||
      (statusFilter === "draft" && !set.published);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold"
        >
          Flashcard Management
        </motion.h1>
        
        <Button asChild>
          <Link href="/admin/flashcards/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Flashcard Set
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Sets</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-1 max-w-sm items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcard sets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Loading flashcard sets...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredFlashcards.length > 0 ? (
                    filteredFlashcards.map((set) => (
                      <TableRow key={set._id}>
                        <TableCell className="font-medium">{set.title}</TableCell>
                        <TableCell>{set.flashcards.length}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {set.published ? (
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
                        <TableCell>{new Date(set.createdAt).toLocaleDateString()}</TableCell>                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/flashcards/${set._id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/flashcards/sets/${set._id}`} target="_blank">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleTogglePublish(set._id, set.published)}
                              className={set.published ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                            >
                              {set.published ? "Unpublish" : "Publish"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(set._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No flashcard sets found matching your query</p>
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
