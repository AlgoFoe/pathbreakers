import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Flashcard from "@/lib/database/models/flashcard.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { flashcardId: string } }
) {
  try {
    await connectToDatabase();

    const flashcard = await Flashcard.findById(params.flashcardId).lean();

    if (!flashcard) {
      return NextResponse.json(
        { success: false, message: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: flashcard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch flashcard" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { flashcardId: string } }
) {
  try {
    // Get user ID if available, but don't require it
    const { userId } = auth();

    await connectToDatabase();
    
    const data = await req.json();
    const { question, answer, category, difficulty } = data;
    
    if (!question || !answer || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      params.flashcardId,
      {
        question,
        answer,
        category,
        difficulty,
      },
      { new: true }
    ).lean();

    if (!updatedFlashcard) {
      return NextResponse.json(
        { success: false, message: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedFlashcard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update flashcard" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { flashcardId: string } }
) {
  try {
    // Get user ID if available, but don't require it
    const { userId } = auth();

    await connectToDatabase();

    const deletedFlashcard = await Flashcard.findByIdAndDelete(params.flashcardId).lean();

    if (!deletedFlashcard) {
      return NextResponse.json(
        { success: false, message: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: deletedFlashcard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete flashcard" },
      { status: 500 }
    );
  }
}
