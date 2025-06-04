import { NextRequest, NextResponse } from "next/server";
import { seedFlashcards } from "../flashcards.js";

export async function GET(req: NextRequest) {
  try {
    const result = await seedFlashcards();
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error("Error in flashcards seed route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed flashcards" },
      { status: 500 }
    );
  }
}
