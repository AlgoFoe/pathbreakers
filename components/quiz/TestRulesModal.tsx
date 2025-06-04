"use client";

import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Quiz } from "@/app/(root)/dashboard/quiz/page";
import { formatDate } from "@/lib/utils";

interface TestRulesModalProps {
  quiz: Quiz;
}

const TestRulesModal = ({ quiz }: TestRulesModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-indigo-600 bg-gray-100 hover:bg-gray-200">
          <Info className="h-4 w-4 mr-2" /> Test Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[40rem] p-4 overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{quiz.title} - Test Details</DialogTitle>
          <DialogDescription>
            Please review the test details and instructions below before starting.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Test Information</h3>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(quiz.date)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{quiz.duration}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{quiz.questionsCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{quiz.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Marking Scheme</h3>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Correct Answer:</span>
                  <span className="font-medium text-green-600">+4 marks</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Incorrect Answer:</span>
                  <span className="font-medium text-red-600">-1 mark</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Unattempted:</span>
                  <span className="font-medium">0 marks</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{quiz.questionsCount * 4}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Syllabus Covered</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 pl-2 space-y-1">
              {quiz.syllabus.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Test Instructions</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 pl-2 space-y-2">
              <li>The test will be conducted in full-screen mode. Exiting full screen will count as a warning.</li>
              <li>You will receive <span className="font-semibold text-red-600">only one warning</span> for switching tabs. Second violation will automatically submit your test.</li>
              <li>The timer cannot be paused once the test starts.</li>
              <li>You can mark questions for review and revisit them before final submission.</li>
              <li>Questions can be navigated using the question palette on the right side.</li>
              <li>Internet connection is required throughout the test. Brief disconnections will not affect your progress.</li>
              <li>Your answers are saved automatically as you progress through the test.</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
            <DialogTrigger asChild>
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
              I Understand
            </Button>
            </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestRulesModal;
