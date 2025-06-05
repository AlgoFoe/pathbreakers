'use client'
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Tag, User2 } from 'lucide-react';
import Image from 'next/image';
import AdminActions from '@/components/blogs/AdminActions';
import { useState, useEffect } from 'react';

interface BlogPageProps {
  params: {
    blogId: string;
  };
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  tags: string[];
  published: boolean;
  createdAt: string;
}

const BlogPage = ({ params }: BlogPageProps) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isAdmin = true; // Remove auth requirement - allow admin actions for all users

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log(`Fetching blog with ID: ${params.blogId}`);
        
        const response = await fetch(`/api/blogs/${params.blogId}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-no-auth': 'true'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch blog');
        }
        
        setBlog(result.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.blogId]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-[300px] bg-gray-300 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600">{error || 'The blog you are looking for does not exist.'}</p>
        </div>
      </div>
    );
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