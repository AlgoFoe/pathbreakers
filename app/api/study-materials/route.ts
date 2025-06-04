import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import StudyMaterial from "@/lib/database/models/study-material.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    // Build the search filter
    const filter: any = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Get study materials
    const studyMaterials = await StudyMaterial.find(filter)
      .sort({ uploadDate: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: studyMaterials },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch study materials" },
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
    
    // Handle form data upload
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const file = formData.get('file') as File;
    
    if (!title || !description || !category || !file) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    // const storage = getStorage(); // e.g., Firebase Storage
    // const fileRef = ref(storage, `study-materials/${Date.now()}-${file.name}`);
    // await uploadBytes(fileRef, file);
    // const fileUrl = await getDownloadURL(fileRef);
      // For this implementation, create a safe filename to avoid collisions
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const fileUrl = `/${safeName}`;
    const fileType = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    const fileSize = file.size;
    
    const newMaterial = await StudyMaterial.create({
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      category,
      createdBy: userId,
    });

    return NextResponse.json(
      { success: true, data: newMaterial },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating study material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create study material" },
      { status: 500 }
    );
  }
}
