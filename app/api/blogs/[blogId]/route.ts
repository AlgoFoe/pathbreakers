import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Blog from "@/lib/database/models/blog.model";
import { auth } from "@clerk/nextjs/server";

// Helper function to check if user is the author or an admin
async function isAuthorizedToModify(blogId: string, userId: string) {
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return false;
    
    return blog.authorId === userId;
  } catch (error) {
    console.error("Error checking authorization:", error);
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const { blogId } = params;
      // Get auth info
    const { userId } = auth();
    
    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }    await connectToDatabase();
    // First try to find by ID (if it looks like a MongoDB ObjectId)
    let blog;
    
    if (/^[0-9a-fA-F]{24}$/.test(blogId)) {
      // If it matches the format of MongoDB ObjectId, try to find by ID
      blog = await Blog.findById(blogId).lean();
    }
    
    // If not found by ID, try by slug
    if (!blog) {
      blog = await Blog.findOne({ slug: blogId }).lean();
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }    // For unpublished blogs, we'll still let them through for now
    // This would normally restrict access to unpublished blogs

    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    // Get user ID if available, but don't require it
    const { userId } = auth();
    const { blogId } = params;

    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user is authorized to modify this blog
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    const isAuthorized = await isAuthorizedToModify(blogId, userId);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Not authorized to modify this blog" },
        { status: 403 }
      );
    }    const data = await req.json();
    const { 
      title, 
      summary, 
      content, 
      coverImage, 
      tags, 
      slug, 
      published,
      category,
      featured,
      metaTitle,
      metaDescription,
      scheduledPublishDate
    } = data;

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $set: {
          title,
          summary,
          content,
          coverImage,
          tags,
          slug,
          published,
          category,
          featured,
          metaTitle,
          metaDescription,
          scheduledPublishDate
        },
      },
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    
    // Check for duplicate slug error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, message: "A blog with this slug already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    // Get user ID if available, but don't require it
    const { userId } = auth();
    const { blogId } = params;

    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();    // Temporarily skip authorization check
    // const isAuthorized = await isAuthorizedToModify(blogId, userId);
    // if (!isAuthorized) {
    //   return NextResponse.json(
    //     { success: false, message: "Not authorized to delete this blog" },
    //     { status: 403 }
    //   );
    // }

    // Delete the blog
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
