import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz, QuizAttempt } from '@/lib/database/models/quiz.model';
import { isAdmin } from '@/app/admin/auth';

// GET /api/admin/quizzes/[id]/stats - Get quiz attempt statistics (admin only)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Admin authentication check
    const adminCheck = await isAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    // Get the quiz
    const quiz = await Quiz.findOne({ id });
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Get all attempts for this quiz
    const attempts = await QuizAttempt.find({ quizId: id });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(attempt => attempt.isCompleted).length;
    const averageScore = attempts.length > 0 
      ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts 
      : 0;
    const highestScore = attempts.length > 0
      ? Math.max(...attempts.map(attempt => attempt.score || 0))
      : 0;
    const lowestScore = completedAttempts > 0
      ? Math.min(...attempts.filter(a => a.isCompleted).map(attempt => attempt.score || 0))
      : 0;
    
    // Calculate distribution of scores
    const scoreRanges = [
      { range: '0-25%', count: 0 },
      { range: '26-50%', count: 0 },
      { range: '51-75%', count: 0 },
      { range: '76-100%', count: 0 }
    ];
    
    attempts.forEach(attempt => {
      if (!attempt.isCompleted || attempt.score === undefined || attempt.totalMarks === undefined || attempt.totalMarks === 0) {
        return;
      }
      
      const percentage = (attempt.score / attempt.totalMarks) * 100;
      
      if (percentage <= 25) {
        scoreRanges[0].count++;
      } else if (percentage <= 50) {
        scoreRanges[1].count++;
      } else if (percentage <= 75) {
        scoreRanges[2].count++;
      } else {
        scoreRanges[3].count++;
      }
    });

    // Calculate per-question statistics
    const questionStats = quiz.questions.map((question: any) => {
      interface QuestionAttempt {
        questionId: string;
        selectedOption?: string;
        isCorrect?: boolean;
      }
      
      // Define the structure for attempts related to questions
      interface QuizAttemptModel {
        questionAttempts: QuestionAttempt[];
        score?: number;
        isCompleted: boolean;
        totalMarks?: number;
      }

      const questionAttempts: QuestionAttempt[] = attempts.flatMap((attempt: QuizAttemptModel) => 
        attempt.questionAttempts.filter(q => q.questionId === question.id)
      );
      
      const totalAnswered = questionAttempts.filter(q => q.selectedOption).length;
      const correctAnswers = questionAttempts.filter(q => q.isCorrect).length;
      
      return {
        questionId: question.id,
        questionText: question.question.substring(0, 50) + (question.question.length > 50 ? '...' : ''),
        totalAnswered,
        correctAnswers,
        correctPercentage: totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0
      };
    });

    // Return statistics
    return NextResponse.json({
      totalAttempts,
      completedAttempts,
      averageScore,
      highestScore,
      lowestScore,
      scoreDistribution: scoreRanges,
      questionStats
    }, { status: 200 });
    
  } catch (error) {
    console.error(`Error fetching quiz statistics for ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz statistics' },
      { status: 500 }
    );
  }
}
