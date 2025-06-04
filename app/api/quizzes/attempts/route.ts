import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { QuizAttempt } from '@/lib/database/models/quiz.model';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
      // Debug logging for development
    console.log("Looking up attempts for userId:", userId);
      // Find quiz attempts where the userIds array includes this user's ID
    const attempts = await QuizAttempt.find({
      userIds: userId.toString(),  // Check if the user's ID is in the userIds array
      isCompleted: true
    });
      // Create a map to store the most recent attempt for each quiz
    const quizAttemptsMap = new Map();
    
    // For each attempt, store it in the map if it's more recent than what we already have
    attempts.forEach(attempt => {
      if (!quizAttemptsMap.has(attempt.quizId) || 
          attempt.endTime > quizAttemptsMap.get(attempt.quizId).endTime) {
        quizAttemptsMap.set(attempt.quizId, {
          quizId: attempt.quizId,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          endTime: attempt.endTime
        });
      }
    });
    
    // Convert the map to an array
    const quizAttempts = Array.from(quizAttemptsMap.values());
    
    console.log("Found attempted quizzes with scores:", quizAttempts);
    
    return NextResponse.json(quizAttempts, { status: 200 });
  } catch (error) {
    console.error('Error fetching attempted quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempted quizzes' },
      { status: 500 }
    );
  }
}
