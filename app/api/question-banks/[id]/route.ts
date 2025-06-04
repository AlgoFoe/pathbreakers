import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import QuestionBank from '@/lib/database/models/questionBank.model';

interface Params {
  params: {
    id: string;
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const questionBank = await QuestionBank.findOne({ id, status: 'published' });
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found or not published' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.json(questionBank);
  } catch (error) {
    console.error(`Error getting question bank with ID ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
