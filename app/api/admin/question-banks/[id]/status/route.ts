import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { isAdminRequest } from '@/lib/api-admin-auth';
import QuestionBank from '@/lib/database/models/questionBank.model';

interface Params {
  params: {
    id: string;
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
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
    const { status } = await req.json();
    
    // Validate status
    if (!status || !['draft', 'published'].includes(status)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid status value' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the question bank status
    const updatedQuestionBank = await QuestionBank.findOneAndUpdate(
      { id },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      },
      { new: true }
    ).select('-questions');
    
    if (!updatedQuestionBank) {
      return new NextResponse(JSON.stringify({ error: 'Question bank not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.json(updatedQuestionBank);
  } catch (error) {
    console.error(`Error updating status for question bank with ID ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
