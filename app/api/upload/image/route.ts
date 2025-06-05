import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // Get form data with the uploaded file
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image provided" },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "File type not allowed. Only JPG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Max 5MB file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }// Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blogs');
    
    // Create directory if it doesn't exist
    try {
      await import('fs').then(async (fs) => {
        // Check if directory exists
        if (!fs.existsSync(uploadDir)) {
          // Create the directory structure recursively
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log(`Created directory: ${uploadDir}`);
        }
      });
    } catch (err) {
      console.error('Error creating directory:', err);
      throw err;
    }
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the URL to the uploaded file
    const fileUrl = `/uploads/blogs/${fileName}`;

    return NextResponse.json(
      { 
        success: true, 
        url: fileUrl,
        message: "Image uploaded successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
