import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import FlashcardSet from "@/lib/database/models/flashcardSet.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();    const flashcardSet = await FlashcardSet.findById(params.id)
      .select('title description category flashcards published createdAt updatedAt')
      .lean();

    if (!flashcardSet) {
      return NextResponse.json(
        { success: false, message: "Flashcard set not found" },
        { status: 404 }
      );
    }

    // Only return published sets for regular users
    if (!(flashcardSet as any).published) {
      return NextResponse.json(
        { success: false, message: "Flashcard set not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...flashcardSet,
        flashcardCount: (flashcardSet as any).flashcards?.length || 0
      }
    });

  } catch (error) {
    console.error("Error fetching flashcard set:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch flashcard set" 
      },
      { status: 500 }
    );
  }
}
