import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import FlashcardSet from "@/lib/database/models/flashcardSet.model";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');

    // Build filter object for published flashcard sets only
    let filter: any = { published: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    const flashcardSets = await FlashcardSet.find(filter)
      .select('title description category flashcards createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Add flashcard count to each set
    const setsWithCount = flashcardSets.map(set => ({
      ...set,
      flashcardCount: set.flashcards?.length || 0
    }));

    return NextResponse.json({
      success: true,
      data: setsWithCount
    });

  } catch (error) {
    console.error("Error fetching flashcard sets:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch flashcard sets" 
      },
      { status: 500 }
    );
  }
}
