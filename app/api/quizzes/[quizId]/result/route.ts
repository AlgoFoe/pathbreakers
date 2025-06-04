import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { QuizAttempt } from '@/lib/database/models/quiz.model';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();      // Get the quiz attempt
      const quizAttempt = await QuizAttempt.findOne({
        quizId: params.quizId,
        userIds: userId.toString(), // Check if user's ID is in the userIds array
        isCompleted: true
      }).sort({ endTime: -1 }); // Get the most recent completed attempt
      
      if (!quizAttempt) {
        return NextResponse.json(
          { error: 'Quiz attempt not found' },
          { status: 404 }
        );
      }
      
      // Fetch the quiz for additional info
      const { Quiz } = await import('@/lib/database/models/quiz.model');
      const quiz = await Quiz.findOne({ id: params.quizId });
      
      if (!quiz) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }
        // Format detailed result information
        const formattedQuestions = quiz.questions.map((q: { id: string; question: string; options: { id: string; text: string }[]; correctAnswer: string }) => {
        // Find the user's attempt for this question 
        const attempt = quizAttempt.questionAttempts.find((a: { questionId: string; selectedOption?: string; status?: string; isCorrect?: boolean; timeSpent?: number }) => a.questionId === q.id);

        // Map selectedOption and correctOption to their actual values
        const selectedOption = attempt?.selectedOption
          ? q.options.find((o: { id: string; text: string }) => o.id === attempt.selectedOption)?.text || null
          : null;

        const correctOption = q.options.find((o: { id: string; text: string }) => o.id === q.correctAnswer)?.text || null;

        return {
          id: q.id,
          question: q.question,
          options: q.options.map((o: { id: string; text: string }) => ({ id: o.id, text: o.text })),
          correctOption,
          selectedOption,
          isCorrect: attempt?.isCorrect || false,
          timeSpent: attempt?.timeSpent || 0,
          status: attempt?.status || "not-visited"
        };
      });
      
      // Calculate time metrics
      const timeSpent = quizAttempt.timeSpent || 0;
      const totalTime = quiz.duration * 60; // Convert minutes to seconds
      
      // Prepare a complete result object
      const result = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        date: quiz.date,
        duration: quiz.duration,
        totalQuestions: quiz.questions.length,
        correctAnswers: quizAttempt.correctAnswers || 0,
        incorrectAnswers: quizAttempt.incorrectAnswers || 0,
        unattempted: quizAttempt.unattempted || 0,
        score: quizAttempt.score || 0,
        totalMarks: quizAttempt.totalMarks || 0,
        timeSpent: timeSpent,
        totalTime: totalTime,
        questions: formattedQuestions
      };
      
      return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`Error fetching quiz result ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz result' },
      { status: 500 }
    );
  }
}
