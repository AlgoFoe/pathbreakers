import axios from 'axios';

export interface BlogData {
  id?: string;
  _id?: string; // MongoDB identifier
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  authorId?: string;
  slug?: string;
  tags?: string[];
  category?: string;
  published?: boolean;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  scheduledPublishDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const BlogService = {
  // Get all blogs with filtering, pagination
  async getBlogs(params?: {
    query?: string;
    tag?: string;
    category?: string;
    published?: boolean;
    limit?: number;
    page?: number;
  }) {
    try {
      const response = await axios.get(`${API_URL}/api/blogs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get a blog by ID or slug
  async getBlogByIdOrSlug(idOrSlug: string) {
    try {
      const response = await axios.get(`${API_URL}/api/blogs/${idOrSlug}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  },

  // Create a new blog
  async createBlog(data: BlogData) {
    try {
      // Generate a slug from the title if not provided
      if (!data.slug) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Set author to admin if not provided
      if (!data.authorId) {
        data.authorId = 'admin';
      }

      const response = await axios.post(`${API_URL}/api/blogs`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update a blog
  async updateBlog(id: string, data: BlogData) {
    try {
      // Generate a slug from the title if not provided
      if (!data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const response = await axios.put(`${API_URL}/api/blogs/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Delete a blog
  async deleteBlog(id: string) {
    try {
      const response = await axios.delete(`${API_URL}/api/blogs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },
  // Update blog status (publish or unpublish)
  async updateBlogStatus(id: string, published: boolean) {
    try {
      const response = await axios.patch(`${API_URL}/api/blogs/${id}/status`, { published });
      return response.data.data;
    } catch (error) {
      console.error('Error updating blog status:', error);
      throw error;
    }
  },

  // Upload blog cover image
  async uploadCoverImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_URL}/api/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  },
};

export default BlogService;
