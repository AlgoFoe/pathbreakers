import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz } from '@/lib/database/models/quiz.model';
import { isAdmin } from '@/app/admin/auth';

// PATCH /api/admin/quizzes/[id]/status - Update quiz status (admin only)
export async function PATCH(
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
    const { status } = await req.json();

    // Validate status
    if (!["upcoming", "live", "archived"].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: upcoming, live, archived' },
        { status: 400 }
      );
    }

    // Update the quiz status
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { id },
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Quiz status updated successfully', quiz: updatedQuiz },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating quiz status ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update quiz status' },
      { status: 500 }
    );
  }
}
