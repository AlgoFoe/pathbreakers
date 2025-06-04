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

    await connectToDatabase();
      // Find if the user has attempted this quiz by checking if their ID is in the userIds array
    const quizAttempt = await QuizAttempt.findOne({
      quizId: params.quizId,
      userIds: userId.toString(),
      isCompleted: true
    });
    
    return NextResponse.json({
      hasAttempted: !!quizAttempt,
      attemptId: quizAttempt ? quizAttempt._id : null
    }, { status: 200 });
  } catch (error) {
    console.error(`Error checking quiz attempt ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to check quiz attempt' },
      { status: 500 }
    );
  }
}
