import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { isAdminRequest } from '@/lib/api-admin-auth';
import QuestionBank from '@/lib/database/models/questionBank.model';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
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
    
    // Get all question banks
    const questionBanks = await QuestionBank.find({})
      .select('-questions')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(questionBanks);
  } catch (error) {
    console.error('Error getting question banks:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: NextRequest) {
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
    
    const data = await req.json();
    
    // Generate a unique ID if not provided
    if (!data.id) {
      data.id = uuidv4();
    }
    
    // Set created date if not provided
    if (!data.createdAt) {
      data.createdAt = new Date();
    }
    
    // Set updated date
    data.updatedAt = new Date();
    
    // Set questions count if we have questions
    if (data.questions && Array.isArray(data.questions)) {
      data.questionsCount = data.questions.length;
    }
    
    const newQuestionBank = new QuestionBank(data);
    await newQuestionBank.save();
    
    return NextResponse.json(newQuestionBank, { status: 201 });
  } catch (error) {
    console.error('Error creating question bank:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
