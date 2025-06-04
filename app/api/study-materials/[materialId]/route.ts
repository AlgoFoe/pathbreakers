import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import StudyMaterial from "@/lib/database/models/study-material.model";
import { auth } from "@clerk/nextjs/server";

interface Params {
  params: {
    materialId: string;
  }
}

// Get a specific study material by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { materialId } = params;
    
    await connectToDatabase();
    
    const material = await StudyMaterial.findById(materialId);
    
    if (!material) {
      return NextResponse.json(
        { success: false, message: "Study material not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: material }, { status: 200 });
  } catch (error) {
    console.error("Error fetching study material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch study material" },
      { status: 500 }
    );
  }
}

// Update a study material
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { materialId } = params;
    const body = await req.json();
    
    await connectToDatabase();
    
    const material = await StudyMaterial.findById(materialId);
    
    if (!material) {
      return NextResponse.json(
        { success: false, message: "Study material not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this material
    if (material.createdBy.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this material" },
        { status: 403 }
      );
    }
    
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      materialId,
      { ...body },
      { new: true }
    );
    
    return NextResponse.json(
      { success: true, data: updatedMaterial },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating study material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update study material" },
      { status: 500 }
    );
  }
}

// Delete a study material
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { materialId } = params;
    
    await connectToDatabase();
    
    const material = await StudyMaterial.findById(materialId);
    
    if (!material) {
      return NextResponse.json(
        { success: false, message: "Study material not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this material
    if (material.createdBy.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to delete this material" },
        { status: 403 }
      );
    }
    
    await StudyMaterial.findByIdAndDelete(materialId);
    
    return NextResponse.json(
      { success: true, message: "Study material deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting study material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete study material" },
      { status: 500 }
    );
  }
}
