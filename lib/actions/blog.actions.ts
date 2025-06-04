"use server";

import { revalidatePath } from "next/cache";

export interface BlogData {
  id?: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  slug?: string;
  tags?: string[];
  published?: boolean;
}

export async function getBlogs(params?: {
  query?: string;
  tag?: string;
  limit?: number;
  page?: number;
}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params?.query) queryParams.append("query", params.query);
    if (params?.tag) queryParams.append("tag", params.tag);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    
    const queryString = queryParams.toString();
      // Make API call
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${baseUrl}/api/blogs${queryString ? `?${queryString}` : ''}`;
    console.log("Fetching blogs from:", url);
    
    const response = await fetch(
      url,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
}

export async function getBlogByIdOrSlug(idOrSlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${baseUrl}/api/blogs/${idOrSlug}`;
    
    const response = await fetch(
      url,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    throw error;
  }
}

export async function createBlog(data: BlogData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${baseUrl}/api/blogs`;
    
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create blog');
    }
    
    const result = await response.json();
    revalidatePath('/dashboard/blogs');
    return result.data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
}

export async function updateBlog(id: string, data: BlogData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${baseUrl}/api/blogs/${id}`;
    
    const response = await fetch(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update blog');
    }
    
    const result = await response.json();
    revalidatePath('/dashboard/blogs');
    revalidatePath(`/blogs/${id}`);
    revalidatePath(`/blogs/${data.slug}`);
    return result.data;
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
}

export async function deleteBlog(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${baseUrl}/api/blogs/${id}`;
    
    const response = await fetch(
      url,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete blog');
    }
    
    const result = await response.json();
    revalidatePath('/dashboard/blogs');
    return result.data;
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
}
