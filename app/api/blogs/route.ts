import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Blog from "@/lib/database/models/blog.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const publishedParam = searchParams.get("published");
      // Get user ID if available, but don't require it
    const { userId } = auth();
    
    // Build the search filter
    const filter: any = {};
    
    // Handle published status
    if (publishedParam === 'false' && userId) {
      // Allow filtering for unpublished blogs if user is logged in
      filter.published = false;
    } else if (publishedParam === 'true' || !publishedParam) {
      // Default to showing published blogs
      filter.published = true;
    }

    if (query) {
      filter.$text = { $search: query };
    }

    if (tag) {
      filter.tags = tag;
    }// Get blogs with pagination
    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // Remove populate since author is now a string
      .lean();

    // Get total count for pagination
    const totalCount = await Blog.countDocuments(filter);

    return NextResponse.json(
      { 
        success: true, 
        data: blogs,
        pagination: {
          total: totalCount,
          page,
          pages: Math.ceil(totalCount / limit),
          limit
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID if available, but don't require it
    const { userId } = auth();

    await connectToDatabase();
    
    const data = await req.json();
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
    
    if (!title || !summary || !content || !coverImage) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }      
    // Create a new blog post
    const newBlog = await Blog.create({
      title,
      summary,
      content,
      coverImage,
      authorId: String(userId),  
      slug: slug || undefined,
      tags: tags || [],
      category: category || 'Uncategorized',
      published: published !== undefined ? published : true,
      featured: featured || false,
      metaTitle,
      metaDescription,
      scheduledPublishDate
    });

    return NextResponse.json(
      { success: true, data: newBlog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    
    // Check for duplicate slug error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, message: "A blog with this slug already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to create blog" },
      { status: 500 }
    );
  }
}
