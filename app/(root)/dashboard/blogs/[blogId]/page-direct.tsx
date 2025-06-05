import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Tag, User2 } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import AdminActions from '@/components/blogs/AdminActions';

interface BlogPageProps {
  params: {
    blogId: string;
  };
}

export async function generateMetadata(
  { params }: BlogPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // Construct URL properly depending on environment
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
    }
    
    const response = await fetch(`${baseUrl}/api/blogs/${params.blogId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-no-auth': 'true'
      }
    });
    
    if (!response.ok) {
      return {
        title: 'Blog Not Found | Pathbreakers',
      };
    }
    
    const result = await response.json();
    const blog = result.data;
    
    if (!blog) {
      return {
        title: 'Blog Not Found | Pathbreakers',
      };
    }
    
    return {
      title: `${blog.title} | Pathbreakers`,
      description: blog.summary,
      openGraph: {
        images: [{ url: blog.coverImage }],
      },
    };
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    return {
      title: 'Blog | Pathbreakers',
    };
  }
}

const BlogPage = async ({ params }: BlogPageProps) => {
  let blog;
  
  // Check if user is admin
  const { userId } = auth();
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  try {
    // Construct URL properly depending on environment
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
    }
    
    // Make API call with x-no-auth header
    console.log('Fetching blog with URL:', `${baseUrl}/api/blogs/${params.blogId}`);
    const response = await fetch(`${baseUrl}/api/blogs/${params.blogId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-no-auth': 'true'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch blog: ${response.status}`);
      notFound();
    }
    
    const result = await response.json();
    blog = result.data;
    
    // If blog is not published and user is not admin, show not found
    if (!blog.published && !isAdmin) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching blog:', error);
    notFound();
  }

  if (!blog) {
    notFound();
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }); 
  const authorName = 'Mr. Krishna Thakur'; 

  return (
    <div className="container max-w-6xl mx-auto p-4 text-black">
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>

        {/* Blog Header */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {blog.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100">
                <Tag className="h-3 w-3 mr-1" /> {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold">{blog.title}</h1>

          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-6 gap-y-2">
            <div className="flex items-center gap-1">
              <User2 className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <time>{formattedDate}</time>
            </div>
          </div>
          
          {isAdmin && (
            <AdminActions 
              blogId={blog._id} 
              isPublished={blog.published} 
              // Remove the slug prop if it's not needed in AdminActions
            />
          )}
        </div>

        {/* Blog Content */}
        <div className="prose prose-sm sm:prose-base max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: blog.content }} 
            className="prose max-w-none"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
