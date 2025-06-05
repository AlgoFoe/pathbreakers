import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Blog from "@/lib/database/models/blog.model";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { blogId: string } } // Changed from 'id' to 'blogId'
) {
  try {
    await connectToDatabase();
    const blog = await Blog.findById(params.blogId); // Changed from 'id' to 'blogId'
    
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    // Get published status from request body
    const { published } = await req.json();

    // Update blog status
    const updatedBlog = await Blog.findByIdAndUpdate(
      params.blogId, // Changed from 'id' to 'blogId'
      { published },
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json(
        { success: false, message: "Failed to update blog status" },
        { status: 500 }
      );
    }// Revalidate related paths to update cache
    revalidatePath("/dashboard/blogs");
    revalidatePath("/admin/blogs");
    revalidatePath(`/dashboard/blogs/${params.blogId}`);
    
    // Also revalidate the slug path if available
    if (updatedBlog.slug) {
      revalidatePath(`/dashboard/blogs/${updatedBlog.slug}`);
    }

    return NextResponse.json(
      { success: true, data: updatedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update blog status" },
      { status: 500 }
    );
  }
}
