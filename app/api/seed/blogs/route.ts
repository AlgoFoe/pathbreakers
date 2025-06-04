import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Blog from "@/lib/database/models/blog.model";
import { blogSeeds } from "../blogs";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();    // Check if resetData flag is present
    const { searchParams } = new URL(req.url);
    const resetData = searchParams.get('resetData') === 'true';
    
    // Check if we already have blogs
    const blogCount = await Blog.countDocuments();
    
    if (blogCount > 0) {
      if (resetData) {
        // Delete existing blogs if resetData is true
        console.log("Resetting existing blogs data...");
        await Blog.deleteMany({});
        console.log("Deleted all existing blogs.");
      } else {
        return NextResponse.json({
          success: true,
          message: `Blogs already seeded. Current count: ${blogCount}. Use ?resetData=true to reseed.`,
        });
      }
    }    // Add user ID to each blog - using authorId field instead of author
    const blogsWithUser = blogSeeds.map(blog => ({
      ...blog,
      authorId: String(userId)  // Use authorId instead of author
    }));

    try {
      // Insert seed data
      console.log("Attempting to insert blogs with user ID:", userId);
      const result = await Blog.insertMany(blogsWithUser);
      console.log("Inserted blogs successfully:", result.length);
    } catch (insertError) {
      console.error("Error during blog insertion:", insertError);
      const errorMessage =
        insertError && typeof insertError === "object" && "message" in insertError
          ? (insertError as { message: string }).message
          : String(insertError);
      return NextResponse.json(
        { success: false, message: `Failed to seed blogs: ${errorMessage}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${blogSeeds.length} blogs.`,
    });
  } catch (error) {
    console.error("Error seeding blogs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed blogs" },
      { status: 500 }
    );
  }
}
