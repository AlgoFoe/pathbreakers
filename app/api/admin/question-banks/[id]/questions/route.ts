import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { isAdminRequest } from '@/lib/api-admin-auth';
import QuestionBank from '@/lib/database/models/questionBank.model';
import { v4 as uuidv4 } from 'uuid';

interface Params {
  params: {
    id: string;
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Verify admin authorization
    const isAdmin = await isAdminRequest(req);
    if (!isAdmin) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectToDatabase();
    
    const { id } = params;
    const questionBank = await QuestionBank.findOne({ id }).select('questions');
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.json(questionBank.questions || []);
  } catch (error) {
    console.error(`Error getting questions for question bank with ID ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    // Verify admin authorization
    const isAdmin = await isAdminRequest(req);
    if (!isAdmin) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectToDatabase();
    
    const { id } = params;
    const questionData = await req.json();
    
    // Generate a unique ID if not provided
    if (!questionData.id) {
      questionData.id = uuidv4();
    }
    
    const questionBank = await QuestionBank.findOne({ id });
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Add the new question
    questionBank.questions.push(questionData);
    
    // Update the questions count
    questionBank.questionsCount = questionBank.questions.length;
    questionBank.updatedAt = new Date();
    
    await questionBank.save();
    
    return NextResponse.json(questionData, { status: 201 });
  } catch (error) {
    console.error(`Error adding question to question bank with ID ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
