import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Blog from "@/lib/database/models/blog.model";

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const { blogId } = params;
    
    console.log(`[Blog API] Received request for blogId: ${blogId}`);
    console.log(`[Blog API] Request URL: ${req.url}`);
    
    if (!blogId) {
      console.log('[Blog API] No blogId provided');
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log('[Blog API] Database connected');
    
    // First try to find by ID (if it looks like a MongoDB ObjectId)
    let blog;
    
    if (/^[0-9a-fA-F]{24}$/.test(blogId)) {
      console.log(`[Blog API] Attempting to find by ObjectId: ${blogId}`);
      // If it matches the format of MongoDB ObjectId, try to find by ID
      blog = await Blog.findById(blogId).lean();
      console.log(`[Blog API] Found by ID: ${blog ? 'Yes' : 'No'}`);
    }
    
    // If not found by ID, try by slug
    if (!blog) {
      console.log(`[Blog API] Attempting to find by slug: ${blogId}`);
      blog = await Blog.findOne({ slug: blogId }).lean();
      console.log(`[Blog API] Found by slug: ${blog ? 'Yes' : 'No'}`);
      
      // If still not found, let's check what blogs actually exist
      if (!blog) {
        const allBlogs = await Blog.find({}, { slug: 1, title: 1, published: 1 }).lean();
        console.log(`[Blog API] Total blogs in database: ${allBlogs.length}`);
        console.log('[Blog API] Available slugs:', allBlogs.map(b => b.slug));
        
        // Check for similar slugs
        const similarSlugs = allBlogs.filter(b => 
          b.slug.includes('tax') || 
          b.slug.includes('student') || 
          b.slug.includes('indian')
        );
        console.log('[Blog API] Similar slugs found:', similarSlugs.map(b => ({ slug: b.slug, title: b.title })));
      }
    }

    if (!blog) {
      console.log(`[Blog API] Blog not found for: ${blogId}`);
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    console.log(`[Blog API] Successfully found blog: ${blog.title}, published: ${blog.published}`);

    // For unpublished blogs, we'll still let them through for now
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
    const { blogId } = params;

    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

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
