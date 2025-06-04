import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Blog from "@/lib/database/models/blog.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { blogId: string } } // Changed from 'id' to 'blogId'
) {
  try {
    // Check authentication - require admin
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    // In a real production app, we would check user role from Clerk metadata
    // For now, we'll check if the user is the author of the blog
    
    await connectToDatabase();
    const blog = await Blog.findById(params.blogId); // Changed from 'id' to 'blogId'
    
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }
    
    // Check if user is author of the blog
    if (blog.authorId !== userId) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to update this blog" },
        { status: 403 }
      );
    }

    await connectToDatabase();

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
    }    // Revalidate related paths to update cache
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
