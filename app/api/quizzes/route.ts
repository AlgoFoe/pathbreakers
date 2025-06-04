import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz } from '@/lib/database/models/quiz.model';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all quizzes that are live or upcoming, ordered by date
    // Filter out archived quizzes for the user-facing endpoint
    const quizzes = await Quiz.find({ status: { $in: ["live", "upcoming"] } })
      .select('id title date duration questionsCount syllabus status')
      .sort({ date: -1 });

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    
    // Create a new quiz
    const newQuiz = await Quiz.create(body);
    
    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: newQuiz },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
