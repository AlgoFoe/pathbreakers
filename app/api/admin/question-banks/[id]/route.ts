import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { isAdminRequest } from '@/lib/api-admin-auth';
import QuestionBank from '@/lib/database/models/questionBank.model';

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
    const questionBank = await QuestionBank.findOne({ id });
    
    if (!questionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
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
    
    const { id } = params;
    const data = await req.json();
    
    // Update the updated date
    data.updatedAt = new Date();
    
    // Update questions count if we have questions
    if (data.questions && Array.isArray(data.questions)) {
      data.questionsCount = data.questions.length;
    }
    
    const updatedQuestionBank = await QuestionBank.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    );
    
    if (!updatedQuestionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.json(updatedQuestionBank);
  } catch (error) {
    console.error(`Error updating question bank with ID ${params.id}:`, error);
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
    
    const { id } = params;
    const deletedQuestionBank = await QuestionBank.findOneAndDelete({ id });
    
    if (!deletedQuestionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.json({ message: 'Question bank deleted successfully' });
  } catch (error) {
    console.error(`Error deleting question bank with ID ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
