"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Search, PlusCircle, Edit, Trash2, MoreVertical, 
  Eye, AlertCircle, BookOpen, Copy
} from "lucide-react";

// Mock data
const mockFlashcards = [
  { id: 1, title: "Biology Terms", cardsCount: 45, createdAt: "2025-05-28", status: "published" },
  { id: 2, title: "Chemistry Formulas", cardsCount: 32, createdAt: "2025-05-25", status: "published" },
  { id: 3, title: "Physics Concepts", cardsCount: 28, createdAt: "2025-05-20", status: "draft" },
  { id: 4, title: "History Important Dates", cardsCount: 50, createdAt: "2025-05-15", status: "published" },
  { id: 5, title: "Mathematics Equations", cardsCount: 36, createdAt: "2025-05-10", status: "draft" },
];

export default function FlashcardsAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredFlashcards = mockFlashcards.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || set.status === statusFilter;
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
                </TableHeader>
                <TableBody>
                  {filteredFlashcards.length > 0 ? (
                    filteredFlashcards.map((set) => (
                      <TableRow key={set.id}>
                        <TableCell className="font-medium">{set.title}</TableCell>
                        <TableCell>{set.cardsCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {set.status === "published" ? (
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
                        <TableCell>{new Date(set.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/flashcards/edit/${set.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/flashcards/${set.id}`} target="_blank">
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
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
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
