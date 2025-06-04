import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { isAdminRequest } from '@/lib/api-admin-auth';
import QuestionBank from '@/lib/database/models/questionBank.model';

interface Params {
  params: {
    id: string;
    questionId: string;
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
    
    const { id, questionId } = params;
    const questionBank = await QuestionBank.findOne({ id });
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const question = questionBank.questions.find((q: { id: string }) => q.id === questionId);
    
    if (!question) {
      return new NextResponse(JSON.stringify({ error: 'Question not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error(`Error getting question ${params.questionId} from question bank ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
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
    
    const { id, questionId } = params;
    const questionData = await req.json();
    
    const questionBank = await QuestionBank.findOne({ id });
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find the question index
    const questionIndex: number = questionBank.questions.findIndex((q: { id: string }) => q.id === questionId);
    
    if (questionIndex === -1) {
      return new NextResponse(JSON.stringify({ error: 'Question not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the question
    questionBank.questions[questionIndex] = {
      ...questionBank.questions[questionIndex],
      ...questionData,
      id: questionId // Ensure ID remains the same
    };
    
    questionBank.updatedAt = new Date();
    await questionBank.save();
    
    return NextResponse.json(questionBank.questions[questionIndex]);
  } catch (error) {
    console.error(`Error updating question ${params.questionId} in question bank ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
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
    
    const { id, questionId } = params;
    const questionBank = await QuestionBank.findOne({ id });
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find the question index
    const questionIndex: number = questionBank.questions.findIndex((q: { id: string }) => q.id === questionId);
    
    if (questionIndex === -1) {
      return new NextResponse(JSON.stringify({ error: 'Question not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Remove the question
    questionBank.questions.splice(questionIndex, 1);
    
    // Update the questions count
    questionBank.questionsCount = questionBank.questions.length;
    questionBank.updatedAt = new Date();
    
    await questionBank.save();
    
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(`Error deleting question ${params.questionId} from question bank ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
