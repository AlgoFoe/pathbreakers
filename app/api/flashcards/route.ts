import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Flashcard from "@/lib/database/models/flashcard.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const query = searchParams.get("query");   
    const filter: any = {};

    if (category && category !== "All" && category !== "all") {
      filter.category = category;
    }

    if (difficulty && difficulty !== "All" && difficulty !== "all") {
      filter.difficulty = difficulty;
    }

    if (query) {
      filter.$or = [
        { question: { $regex: query, $options: "i" } },
        { answer: { $regex: query, $options: "i" } },
      ];
    }

    // Get flashcards
    const flashcards = await Flashcard.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: flashcards },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch flashcards" },
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
    const { question, answer, category, difficulty } = data;
    
    if (!question || !answer || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const newFlashcard = await Flashcard.create({
      question,
      answer,
      category,
      difficulty: difficulty || "medium",
      createdBy: userId,
    });

    return NextResponse.json(
      { success: true, data: newFlashcard },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create flashcard" },
      { status: 500 }
    );
  }
}
