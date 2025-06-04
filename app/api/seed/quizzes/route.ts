import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { Quiz } from '@/lib/database/models/quiz.model';
import { quizzes } from '../quiz-data';

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing quizzes for clean seeding
    await Quiz.deleteMany({});

    // Insert quiz seed data
    await Quiz.insertMany(quizzes);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${quizzes.length} quizzes`,
      quizzes: quizzes.map(quiz => quiz.id)
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed quizzes'
    }, { status: 500 });
  }
}