import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import QuestionBank from '@/lib/database/models/questionBank.model';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get only published question banks for public use
    // Don't include questions to reduce payload size
    const questionBanks = await QuestionBank.find({ status: 'published' })
      .select('-questions')
      .sort({ createdAt: -1 });
    console.log("Question bank:", questionBanks);
    
    return NextResponse.json(questionBanks);
  } catch (error) {
    console.error('Error getting published question banks:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
