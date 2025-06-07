import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import FlashcardSet from "@/lib/database/models/flashcardSet.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const query = searchParams.get("query");
    
    const filter: any = {};

    // Filter by published status
    if (status && status !== "all") {
      filter.published = status === "published";
    }

    // Search by title
    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }

    const flashcardSets = await FlashcardSet.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: flashcardSets },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching flashcard sets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch flashcard sets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const data = await req.json();
    const { title, description, flashcards, category, published } = data;
    
    if (!title || !flashcards || flashcards.length === 0) {
      return NextResponse.json(
        { success: false, message: "Title and flashcards are required" },
        { status: 400 }
      );
    }

    // Validate flashcards
    for (const card of flashcards) {
      if (!card.question || !card.answer) {
        return NextResponse.json(
          { success: false, message: "All flashcards must have question and answer" },
          { status: 400 }
        );
      }
    }
    
    const newFlashcardSet = await FlashcardSet.create({
      title,
      description,
      flashcards,
      category: category || "General",
      published: published || false,
      createdBy: userId,
    });

    return NextResponse.json(
      { success: true, data: newFlashcardSet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flashcard set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create flashcard set" },
      { status: 500 }
    );
  }
}
