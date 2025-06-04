"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileQuestion,
  ChevronRight,
  BookOpen,
  Sparkles
} from "lucide-react";
import QuestionBankService, { QuestionBankData } from "@/lib/services/questionBank.service";
import { useToast } from "@/components/ui/use-toast";

export default function QuestionBankList() {
  const [questionBanks, setQuestionBanks] = useState<QuestionBankData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchQuestionBanks();
  }, []);
  
  const fetchQuestionBanks = async () => {
    try {
      setIsLoading(true);
      const data = await QuestionBankService.getQuestionBanks(false);
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
    const matchesSearch = bank.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bank.subject && bank.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl text-black">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Question Banks</h1>
      </div>
      
      <p className="text-muted-foreground">
        Explore our collection of question banks to test your knowledge and prepare for exams.
      </p>
      
      {/* Search section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, category or subject..."
            className="pl-10 bg-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
        {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading question banks...</p>
          </div>
        </div>
      ) : (
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuestionBanks.length > 0 ? (
            filteredQuestionBanks.map((bank, index) => (
              <motion.div
                key={bank.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }
                  }
                }}
                className="h-full"
              >
                <Link href={`/dashboard/question-banks/${bank.id}`}>
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden bg-white">
                    <div className="p-6">
                      <div className="flex gap-4 items-start">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <FileQuestion className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="font-semibold line-clamp-2">{bank.title}</h3>
                          {bank.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{bank.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-sky-100 text-blue-600 hover:bg-blue-200">
                              {bank.category}
                            </Badge>
                            <span className="text-xs text-gray-500">{bank.questionsCount} questions</span>
                          </div>
                          {bank.subject && (
                            <Badge variant="outline" className="bg-sky-100 text-blue-600 hover:bg-blue-200">
                              {bank.subject}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-200 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-medium">View Questions</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
              <FileQuestion className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold">No question banks found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria" : "No published question banks available yet"}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
