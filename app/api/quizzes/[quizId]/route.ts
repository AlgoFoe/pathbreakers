import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz } from '@/lib/database/models/quiz.model';

export async function GET(
  _req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectToDatabase();

    const quiz = await Quiz.findOne({ id: params.quizId });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error(`Error fetching quiz ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { id: params.quizId },
      { $set: { ...body, updatedAt: Date.now() } },
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
    console.error(`Error updating quiz ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectToDatabase();
    
    const deletedQuiz = await Quiz.findOneAndDelete({ id: params.quizId });

    if (!deletedQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting quiz ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
