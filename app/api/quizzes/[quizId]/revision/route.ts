import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz, QuizAttempt } from '@/lib/database/models/quiz.model';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _req: Request,
  { params }: { params: { quizId: string } }
) {
  try {    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
      // Get the quiz with questions and correct answers
    const quiz = await Quiz.findOne({ id: params.quizId })
      .select('id title date duration questions');
        // Get the user's attempt for this quiz - check in the userIds array
    const quizAttempt = await QuizAttempt.findOne({
      quizId: params.quizId,
      userIds: userId.toString(), // Check if the user's ID is in the userIds array
      isCompleted: true
    }).sort({ endTime: -1 }); // Get the most recent completed attempt
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    // Format data for revision
    interface Question {
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
    }
    
    interface QuestionAttempt {
      questionId: string;
      selectedOption: string | null;
      isCorrect: boolean;
    }
    
    interface RevisionQuestion {
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
      selectedAnswer: string | null;
      isCorrect: boolean;
    }
    
    interface RevisionData {
      id: string;
      title: string;
      date: Date;
      duration: number;
      questions: RevisionQuestion[];
    }
    
    const revisionData: RevisionData = {
      id: quiz.id,
      title: quiz.title,
      date: quiz.date,
      duration: quiz.duration,
      questions: quiz.questions.map((question: Question) => {
      // Find the user's attempt for this question if it exists
      const attempt: QuestionAttempt | undefined = quizAttempt?.questionAttempts.find(
        (a: QuestionAttempt) => a.questionId === question.id
      );
      
      return {
        id: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: attempt?.selectedOption || null,
        isCorrect: attempt?.isCorrect || false
      };
      })
    };
    
    return NextResponse.json(revisionData, { status: 200 });
  } catch (error) {
    console.error(`Error fetching quiz revision ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz revision' },
      { status: 500 }
    );
  }
}
