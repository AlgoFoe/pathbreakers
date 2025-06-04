"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check, X, BarChart, Clock, Calendar, AlertCircle, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuizResult {
  quizId: string;
  quizTitle: string;
  date: string;
  duration: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  totalMarks: number;
  totalTime: number;
  timeSpent: number;
  questions: {
    id: number;
    question: string;
    options: {
      id: string;
      text: string;
    }[];
    correctOption: string;
    selectedOption?: string;
    isCorrect?: boolean;
    timeSpent: number;
    status?: string;
  }[];
}

export default function QuizResultPage({ params }: { params: { quizId: string } }) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const resultContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        // Fetch quiz result from API
        const response = await fetch(`/api/quizzes/${params.quizId}/result`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz result');
        }
        
        const resultData = await response.json();
        
        // Transform API response to match QuizResult type if needed
        const formattedResult: QuizResult = {
          quizId: resultData.quizId,
          quizTitle: resultData.quizTitle,
          date: new Date(resultData.date).toISOString().split('T')[0],
          duration: `${resultData.duration} minutes`,
          totalQuestions: resultData.totalQuestions,
          correctAnswers: resultData.correctAnswers,
          incorrectAnswers: resultData.incorrectAnswers,
          unattempted: resultData.unattempted,
          score: resultData.score,
          totalMarks: resultData.totalMarks,
          totalTime: resultData.totalTime,
          timeSpent: resultData.timeSpent,
          questions: resultData.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            selectedOption: q.selectedOption,
            isCorrect: q.isCorrect,
            timeSpent: q.timeSpent
          }))
        };        setResult(formattedResult);
        console.log('Quiz result fetched:', formattedResult);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz result:', error);
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [params.quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:mt-0 mt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:mt-0 mt-16 flex flex-col justify-center items-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Result Not Found</h1>
        <p className="text-gray-600 mt-2">The quiz result you are looking for doesn&apos;t exist.</p>
        <Button className="mt-6" variant="outline" onClick={() => window.location.href = "/dashboard/quiz"}>
          Go Back
        </Button>
      </div>
    );
  }

  const percentageScore = ((result.score / result.totalMarks) * 100).toFixed(1);
  const formattedTimeSpent = new Date(result.timeSpent * 1000).toISOString().substring(11, 19);
  
  // Calculate performance metrics
  const avgTimePerQuestion = result.timeSpent / (result.correctAnswers + result.incorrectAnswers);
  const avgTimePerCorrectAnswer = result.timeSpent / result.correctAnswers;
  
  // Get performance grade based on percentage
  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "bg-green-500", text: "Excellent" };
    if (percentage >= 80) return { grade: "A", color: "bg-green-400", text: "Very Good" };
    if (percentage >= 70) return { grade: "B", color: "bg-blue-500", text: "Good" };
    if (percentage >= 60) return { grade: "C", color: "bg-yellow-500", text: "Satisfactory" };
    if (percentage >= 50) return { grade: "D", color: "bg-orange-500", text: "Pass" };
    return { grade: "F", color: "bg-red-500", text: "Needs Improvement" };
  };
    const performance = getPerformanceGrade(parseFloat(percentageScore));
    // Function to generate and download PDF
  const downloadPdf = async () => {
    if (!resultContentRef.current) return;
    
    try {
      setGeneratingPdf(true);

      // Use a smaller custom page size (e.g., 148mm x 210mm, A5 portrait) to reduce empty space
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [148, 210], // A5 size: width 148mm, height 210mm
        compress: true // Enable compression for smaller file size
      });
      
      const logoBase64 = "data:image/png;base64,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"
      const pageWidth = 148; // A5 width
      const pageMargin = 10;
      const contentWidth = pageWidth - (2 * pageMargin);
      
      const logoWidth = 30;
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = pageMargin;
      
      try {
        pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoWidth);
      } catch (imgError) {
        console.error('Error adding logo:', imgError);
      }
      
      // Company name and quiz title
      const headerY = logoY + logoWidth + 5;
      pdf.setTextColor(102, 51, 153); // Purple color
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("PATHBREAKERS", pageWidth/2, headerY, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0); // Black color
      pdf.setFontSize(12);
      pdf.text(`${result.quizTitle} Results`, pageWidth/2, headerY + 8, { align: 'center' });
      
      // Add horizontal divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(pageMargin, headerY + 12, pageWidth - pageMargin, headerY + 12);
      
      // Score summary section - more compact layout
      let currentY = headerY + 20;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Score Summary", pageMargin, currentY);
      currentY += 10;
      
      // Create two-column layout for score details
      const col1X = pageMargin;
      const col2X = pageWidth/2 + 5;
      
      // Score circle
      pdf.setFillColor(245, 245, 245);
      pdf.circle(col1X + 15, currentY + 7, 10, 'F');
      
      pdf.setTextColor(102, 51, 153); // Purple for score
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${percentageScore}%`, col1X + 15, currentY + 9, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      
      // Performance metrics
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Correct: ${result.correctAnswers}`, col2X, currentY);
      pdf.text(`Incorrect: ${result.incorrectAnswers}`, col2X, currentY + 6);
      pdf.text(`Unattempted: ${result.unattempted}`, col2X, currentY + 12);
      pdf.text(`Time: ${formattedTimeSpent}`, col2X, currentY + 18);
      
      currentY += 25;
      
      // Add performance grade
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Grade: ${performance.grade} - ${performance.text}`, pageMargin, currentY);
      currentY += 10;
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Performance Breakdown", pageMargin, currentY);
      currentY += 8;
      
      const accuracy = ((result.correctAnswers / (result.correctAnswers + result.incorrectAnswers)) * 100).toFixed(1);
      const completionRate = (((result.correctAnswers + result.incorrectAnswers) / result.totalQuestions) * 100).toFixed(1);
      const timeUtilization = ((result.timeSpent / result.totalTime) * 100).toFixed(1);
      const barWidth = contentWidth - 40; 
      const drawProgressBar = (y: number, percentage: string | number): void => {
        const barHeight = 4;
        
        // First, save the current graphics state to restore later
        pdf.saveGraphicsState();
        
        // Set line width to thin for clean rendering
        pdf.setLineWidth(0.1);
        
        // Background bar - using gray color
        pdf.setDrawColor(230, 230, 230);
        pdf.setFillColor(230, 230, 230);
        
        // Draw background rectangle - using stroke and fill for robustness
        pdf.rect(pageMargin, y, barWidth, barHeight, 'DF'); // 'DF' = fill then stroke
        
        // Progress fill - using purple color
        const progressWidth = Math.max((barWidth * parseFloat(percentage.toString())) / 100, 1);
        
        // Make sure the progress bar doesn't exceed the background
        const finalProgressWidth = Math.min(progressWidth, barWidth); 
        
        if (finalProgressWidth > 0) {
          pdf.setDrawColor(102, 51, 153); // Purple border
          pdf.setFillColor(102, 51, 153); // Purple fill
          pdf.rect(pageMargin, y, finalProgressWidth, barHeight, 'DF'); // Fill and stroke
        }
        
        // Restore graphics state to avoid affecting other elements
        pdf.restoreGraphicsState();
        
        // Percentage text
        pdf.setFontSize(8);
        pdf.setTextColor(50, 50, 50);
        pdf.text(`${percentage}%`, pageWidth - pageMargin - 5, y + 2.5, { align: 'right' });
      };
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      
      // Accuracy
      pdf.text("Accuracy", pageMargin, currentY);
      drawProgressBar(currentY + 2, accuracy);
      currentY += 10;
      
      // Completion Rate
      pdf.text("Completion Rate", pageMargin, currentY);
      drawProgressBar(currentY + 2, completionRate);
      currentY += 10;
      
      // Time Utilization
      pdf.text("Time Utilization", pageMargin, currentY);
      drawProgressBar(currentY + 2, timeUtilization);
      currentY += 15;
      
      // Time Analysis
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Time Analysis", pageMargin, currentY);
      currentY += 8;
      
      const avgTimePerQuestionStr = Number.isFinite(avgTimePerQuestion)
        ? `${Math.floor(avgTimePerQuestion / 60)}:${Math.floor(avgTimePerQuestion % 60).toString().padStart(2, '0')}`
        : "N/A";
        
      const avgTimePerCorrectAnswerStr = Number.isFinite(avgTimePerCorrectAnswer)
        ? `${Math.floor(avgTimePerCorrectAnswer / 60)}:${Math.floor(avgTimePerCorrectAnswer % 60).toString().padStart(2, '0')}`
        : "N/A";
        
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      
      pdf.text(`Avg. Time per Question:`, pageMargin, currentY);
      pdf.text(avgTimePerQuestionStr, pageWidth - pageMargin, currentY, { align: 'right' });
      currentY += 6;
      
      pdf.text(`Avg. Time per Correct Answer:`, pageMargin, currentY);
      pdf.text(avgTimePerCorrectAnswerStr, pageWidth - pageMargin, currentY, { align: 'right' });
      
      // Add footer
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth/2, 200, { align: 'center' });
      
      // Save the PDF with a nice filename
      pdf.save(`${result.quizTitle.replace(/\s+/g, '-')}-results.pdf`);
      
      setGeneratingPdf(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:mt-0 mt-2">      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
        ref={resultContentRef}
      >
        <header className="mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{result.quizTitle} Results</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(result.date)}
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                {result.duration}
              </p>
            </div>            
            <div className="flex items-center gap-4">            <Button 
                variant={generatingPdf ? "outline" : "default"} 
                onClick={downloadPdf} 
                disabled={generatingPdf}
                className={`flex items-center gap-2 ${generatingPdf ? "" : "bg-purple-700 hover:bg-purple-800"}`}
              >
                {generatingPdf ? 'Generating PDF...' : 'Download Results PDF'}              {generatingPdf ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              {generatingPdf && (
                <p className="text-xs text-gray-500 mt-1">
                  Preparing professional PDF report with your results...
                </p>
              )}
            </div>
          </div>
        </header>        {/* Score Summary Section - Referenced in PDF generation */}
        <section className="mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Score Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-2">
                    <svg className="w-40 h-40">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="70"
                        cx="80"
                        cy="80"
                      />
                      <circle
                        className="text-indigo-600"
                        strokeWidth="8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="70"
                        cx="80"
                        cy="80"
                        strokeDasharray="439.8"
                        strokeDashoffset={439.8 - (439.8 * parseFloat(percentageScore)) / 100}
                        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-4xl font-bold">{percentageScore}%</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Badge className={`px-3 py-1 text-white ${performance.color}`}>
                      Grade {performance.grade} - {performance.text}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex justify-between items-center">
                      <div className="p-2 rounded-full bg-green-100">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
                    </div>
                    <div className="text-sm font-medium text-green-800 mt-2">Correct Answers</div>
                  </Card>

                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex justify-between items-center">
                      <div className="p-2 rounded-full bg-red-100">
                        <X className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="text-3xl font-bold text-red-600">{result.incorrectAnswers}</div>
                    </div>
                    <div className="text-sm font-medium text-red-800 mt-2">Incorrect Answers</div>
                  </Card>

                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="p-2 rounded-full bg-gray-100">
                        <AlertCircle className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-600">{result.unattempted}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-2">Unattempted</div>
                  </Card>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{formattedTimeSpent}</div>
                    </div>
                    <div className="text-sm font-medium text-blue-800 mt-2">Time Spent</div>
                  </Card>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-lg font-medium text-gray-700 mb-2">Performance Breakdown</div>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-sm font-medium">
                        {((result.correctAnswers / (result.correctAnswers + result.incorrectAnswers)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(result.correctAnswers / (result.correctAnswers + result.incorrectAnswers)) * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm font-medium">
                        {(((result.correctAnswers + result.incorrectAnswers) / result.totalQuestions) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={((result.correctAnswers + result.incorrectAnswers) / result.totalQuestions) * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Time Utilization</span>
                      <span className="text-sm font-medium">
                        {((result.timeSpent / result.totalTime) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(result.timeSpent / result.totalTime) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Question Analysis */}
        <section className="mb-8 ">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Analysis</h2>
          <Accordion type="single" collapsible className="w-full h-96 overflow-y-auto">
            {result.questions.map((question) => (
              <AccordionItem key={question.id} value={`question-${question.id}`}>                <AccordionTrigger className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      !question.selectedOption ? 'bg-gray-100 text-gray-600' :
                      question.isCorrect ? 'bg-green-200 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {!question.selectedOption ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : question.isCorrect ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 text-black">Question {question.id}</div>
                    <div className="text-sm text-gray-500">
                      {question.selectedOption ? 
                        `${Math.floor(question.timeSpent / 60)}:${(question.timeSpent % 60).toString().padStart(2, '0')}` :
                        "Unattempted"}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-white border-t">
                  <div className="space-y-4">
                    <div className="text-gray-800">{question.question}</div>
                    <div className="grid gap-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`p-3 rounded-md ${
                            option.text === question.correctOption
                              ? "bg-teal-100 border border-teal-500"
                              : option.text === question.selectedOption && !question.isCorrect
                              ? "bg-red-200 border border-red-500"
                              : "bg-gray-100 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                option.text === question.correctOption
                                  ? "bg-teal-100 text-teal-800"
                                  : option.text === question.selectedOption && !question.isCorrect
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            ></div>
                            <div className="flex-1">{option.text}</div>
                            {option.text === question.selectedOption && !question.isCorrect && (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                            {option.text === question.correctOption && (
                              <Check className="h-5 w-5 text-teal-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Time spent indicator */}
                    <div className="text-sm text-blue-600 mt-3 flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200">
                      <Clock className="h-4 w-4" />
                      Time spent on this question: {question.timeSpent > 0 
                        ? `${Math.floor(question.timeSpent / 60)}:${(question.timeSpent % 60).toString().padStart(2, '0')}`
                        : "No time recorded"
                      }
                    </div>
                      {!question.selectedOption && (
                      <div className="text-sm text-amber-600 mt-2">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        You did not attempt this question
                      </div>
                    )}
                    {question.selectedOption && !question.isCorrect && (
                      <div className="text-sm text-red-600 mt-2">
                        <X className="h-4 w-4 inline mr-1" />
                        Your answer was incorrect. The correct answer is {question.correctOption}.
                      </div>
                    )}

                    {/* Question status display */}
                    {question.status && (
                      <div className="text-sm flex items-center gap-2 mt-3">
                        <span className="font-medium">Status:</span>
                        <span className={`px-2 py-1 rounded-md ${
                          question.status.includes('answered') ? 'bg-blue-100 text-blue-800' :
                          question.status.includes('review') ? 'bg-purple-100 text-purple-800' :
                          question.status === 'un-answered' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {question.status.charAt(0).toUpperCase() + question.status.slice(1).replace(/-/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>        {/* Performance Insights Section - Referenced in PDF generation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardTitle className="mb-4 text-lg">Time Analysis</CardTitle>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Avg. Time per Question</span>
                    <span className="text-sm font-medium">
                      {Number.isFinite(avgTimePerQuestion)
                        ? `${Math.floor(avgTimePerQuestion / 60)}:${Math.floor(avgTimePerQuestion % 60).toString().padStart(2, '0')}`
                        : "Error"}
                    </span>
                  </div>
                  <Progress value={(avgTimePerQuestion / 180) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Avg. Time per Correct Answer</span>
                    <span className="text-sm font-medium">
                      {Number.isFinite(avgTimePerCorrectAnswer)
                        ? `${Math.floor(avgTimePerCorrectAnswer / 60)}:${Math.floor(avgTimePerCorrectAnswer % 60).toString().padStart(2, '0')}`
                        : "Error"}
                    </span>
                  </div>
                  <Progress value={(avgTimePerCorrectAnswer / 180) * 100} className="h-2" />
                </div>
              </div>
            </Card>
                <Card className="p-6">
              <CardTitle className="mb-4 text-lg">Question Time Analysis</CardTitle>
              <div className="space-y-3 h-96 overflow-y-auto">
                {result.questions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[60%]">Q{question.id}:</span>
                    <div className="flex-1 mx-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            question.isCorrect ? 'bg-green-500' : 
                            question.selectedOption ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (question.timeSpent / 180) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 w-16 text-right">
                      {question.timeSpent > 0 
                        ? `${Math.floor(question.timeSpent / 60)}:${(question.timeSpent % 60).toString().padStart(2, '0')}`
                        : "N/A"
                      }
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
        
        <div className="flex justify-center">
            <Button
            onClick={() => window.location.href = "/dashboard/quiz"}
            variant="default"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
            Back to Dashboard
            </Button>
        </div>
      </motion.div>
    </div>
  );
}
