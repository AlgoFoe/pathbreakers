"use client";

import Image from "next/image";
import { format } from "date-fns";

// Import custom styles for blog preview
import "./blog-preview.css";

interface BlogPreviewProps {
  title: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  category?: string;
  publishDate?: Date;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  content,
  coverImage,
  tags = [],
  category,
  publishDate = new Date(),
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow">
      {/* Header with navigation */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-500">Blog Preview</h3>
        <div className="text-sm text-gray-400">
          This is how your blog will appear to readers
        </div>
      </div>

      {/* Blog preview content */}
      <div className="p-6 overflow-auto max-h-[calc(100vh-200px)]">
        {/* Cover image */}
        {coverImage && (
          <div className="relative h-64 md:h-80 w-full mb-6 overflow-hidden rounded-lg">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/assets/images/placeholder.jpg";
              }}
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-6 items-center text-sm text-gray-600">
          {category && (
            <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800">
              {category}
            </span>
          )}

          <span>
            Published on{" "}
            {format(publishDate, "MMMM d, yyyy")}
          </span>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}        {/* Content */}
        <div 
          className="blog-preview-content prose max-w-none" 
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default BlogPreview;
