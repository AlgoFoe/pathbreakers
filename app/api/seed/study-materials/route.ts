import { NextRequest, NextResponse } from "next/server";
import { seedStudyMaterials } from "../study-materials.js";

export async function GET(req: NextRequest) {
  try {
    const result = await seedStudyMaterials();
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error("Error in study materials seed route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed study materials" },
      { status: 500 }
    );
  }
}
