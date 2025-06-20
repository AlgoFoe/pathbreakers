import React from 'react';
import { Metadata } from 'next';
import BlogsDirect from './blogs-direct';
import { auth, currentUser } from '@clerk/nextjs/server';

export const metadata: Metadata = {
  title: 'Blogs | Pathbreakers',
  description: 'Read educational blogs and articles on various subjects',
}

const BlogsPage = async () => {
  let initialBlogs = [];
  let tags: string[] = [];
  
  try {
    // Check if user is admin
    const { userId } = auth();
    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';
    
    // If admin, fetch all blogs; otherwise, fetch only published blogs    // Construct URL properly depending on environment
    let baseUrl;
    if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = 'http://localhost:3000';
    }
    
    const response = await fetch(`${baseUrl}/api/blogs${isAdmin ? '' : '?published=true'}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-no-auth': 'true'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    const blogsResult = await response.json();
    initialBlogs = blogsResult?.data || [];
    
    // Extract unique tags from blogs
    tags = Array.from(
      new Set(initialBlogs.flatMap((blog: any) => blog.tags || []))
    );
  } catch (error) {
    console.error('Error fetching initial blogs:', error);
    // Set default empty values on error
    initialBlogs = [];
    tags = [];
  }
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <BlogsDirect 
        initialBlogs={initialBlogs}
        tags={tags as string[]}
      />
    </div>
  )
}

export default BlogsPage
