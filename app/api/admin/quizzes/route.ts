import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz } from '@/lib/database/models/quiz.model';
import { isAdmin } from '@/app/admin/auth';

// GET /api/admin/quizzes - Get all quizzes (admin only)
export async function GET(req: Request) {
  try {
    // Admin authentication check
    const adminCheck = await isAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all quizzes for admin, including more details
    const quizzes = await Quiz.find({})
      .select('id title date duration questionsCount syllabus status createdAt updatedAt')
      .sort({ updatedAt: -1 });

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error('Error fetching quizzes for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/quizzes - Create a new quiz (admin only)
export async function POST(req: Request) {
  try {
    console.log('Creating a new quiz...');
    
    // Admin authentication check
    const adminCheck = await isAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Clone the request to read the body without consuming it
    const body = await req.json();
    console.log('Request body:', body);
    
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
