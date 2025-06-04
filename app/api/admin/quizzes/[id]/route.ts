import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz, QuizAttempt } from '@/lib/database/models/quiz.model';
import { isAdmin } from '@/app/admin/auth';

// GET /api/admin/quizzes/[id] - Get a quiz by ID (admin only)
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

    // Get the quiz by ID
    const quiz = await Quiz.findOne({ id });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error(`Error fetching quiz ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/quizzes/[id] - Update a quiz (admin only)
export async function PUT(
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
    const body = await req.json();

    // Update the quiz
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { id },
      { ...body, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Quiz updated successfully', quiz: updatedQuiz },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating quiz ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/quizzes/[id] - Delete a quiz (admin only)
export async function DELETE(
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

    // Delete the quiz
    const deletedQuiz = await Quiz.findOneAndDelete({ id });

    if (!deletedQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quizId: id });

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting quiz ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
