"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Info, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TestRulesModal from "./TestRulesModal";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Quiz } from "@/app/(root)/dashboard/quiz/page";

interface QuizCardProps {
  quiz: Quiz;
}

const statusColors = {
  upcoming: "bg-gray-300 text-blue-800",
  live: "bg-green-500 text-white",
  attempted: "bg-purple-100 text-purple-800",
  missed: "bg-red-100 text-red-700",
};

const QuizCard = ({ quiz }: QuizCardProps) => {
  // Only live quizzes are attemptable
  const isAttemptable = quiz.status === "live";
  
  const displayDate = formatDate(quiz.date);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
            <Badge className={statusColors[quiz.status]}>
              {quiz.status === "live" ? "Live Now" : quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{displayDate}</span>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{quiz.duration}</span>
          </div>
        </CardHeader>
        
        <CardContent className="py-2 flex-grow">
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700">Syllabus</div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {quiz.syllabus.join(', ')}
            </p>
          </div>
          
          {quiz.status === "attempted" && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700">Your Score</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold">{quiz.score}/{quiz.totalMarks}</div>
                <div className="text-sm text-gray-500">
                  ({((quiz.score! / quiz.totalMarks!) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between flex-wrap xl:flex-nowrap max-w-full" style={{ maxWidth: "100%" }}>
          <TestRulesModal quiz={quiz} />
            {isAttemptable ? (
            <Button asChild variant="default" className="bg-black hover:bg-gray-800 text-white">
              <Link href={`/dashboard/quiz/${quiz.id}`}>
          Start Test <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : quiz.status === "attempted" ? (
            <div className="flex gap-2">
              <Button asChild variant="outline">
          <Link href={`/dashboard/quiz/results/${quiz.id}`}>
            View Results
          </Link>
              </Button>
              <Button asChild variant="secondary">
          <Link href={`/dashboard/quiz/revision/${quiz.id}`}>
            Revision
          </Link>
              </Button>
            </div>
          ) : (
            <Button variant="outline" disabled className="bg-gray-300 text-black">
              Test Missed
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuizCard;
