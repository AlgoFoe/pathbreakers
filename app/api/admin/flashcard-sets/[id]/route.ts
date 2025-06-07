import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import FlashcardSet from "@/lib/database/models/flashcardSet.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const flashcardSet = await FlashcardSet.findById(params.id).lean();

    if (!flashcardSet) {
      return NextResponse.json(
        { success: false, message: "Flashcard set not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: flashcardSet },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching flashcard set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch flashcard set" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if this is just a publish status update
    if (Object.keys(data).length === 1 && 'published' in data) {
      const updatedFlashcardSet = await FlashcardSet.findByIdAndUpdate(
        params.id,
        { published: data.published },
        { new: true }
      );

      if (!updatedFlashcardSet) {
        return NextResponse.json(
          { success: false, message: "Flashcard set not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: updatedFlashcardSet },
        { status: 200 }
      );
    }

    // Full update
    const { title, description, flashcards, category, published } = data;
    
    if (!title || !flashcards || flashcards.length === 0) {
      return NextResponse.json(
        { success: false, message: "Title and flashcards are required" },
        { status: 400 }
      );
    }

    const updatedFlashcardSet = await FlashcardSet.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        flashcards,
        category: category || "General",
        published: published || false,
      },
      { new: true }
    );

    if (!updatedFlashcardSet) {
      return NextResponse.json(
        { success: false, message: "Flashcard set not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedFlashcardSet },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating flashcard set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update flashcard set" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const deletedFlashcardSet = await FlashcardSet.findByIdAndDelete(params.id);

    if (!deletedFlashcardSet) {
      return NextResponse.json(
        { success: false, message: "Flashcard set not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Flashcard set deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting flashcard set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete flashcard set" },
      { status: 500 }
    );
  }
}
