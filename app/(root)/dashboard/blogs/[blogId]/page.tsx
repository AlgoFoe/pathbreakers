import { Badge } from '@/components/ui/badge';
import BlogService from '@/lib/services/blog.service';
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
    const blog = await BlogService.getBlogByIdOrSlug(params.blogId);
    
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
    blog = await BlogService.getBlogByIdOrSlug(params.blogId);
    
    // If blog is not published and user is not admin, show not found
    if (!blog.published && !isAdmin) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching blog:', error);
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
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>        {/* Admin Actions */}
        {isAdmin && (
          <AdminActions blogId={blog._id} isPublished={blog.published} />
        )}
        
        {/* Blog Summary */}
        <div className="border-l-4 border-gray-200 pl-4 italic text-gray-600">
          {blog.summary}
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
