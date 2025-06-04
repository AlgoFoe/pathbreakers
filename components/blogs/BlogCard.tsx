"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { CalendarIcon, User2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  tags?: string[];  
  authorId?: string;  // Using authorId instead of author
  createdAt: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  slug,
  title,
  summary,
  coverImage,
  tags,
  authorId,
  createdAt
}) => {
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  // Get author name
  const authorName = 'Mr. Krishna Thakur' ;
    return (    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >      <Link href={`/dashboard/blogs/${slug || id}`} className="h-full">
        <Card className="overflow-hidden border border-gray-200 h-full flex flex-col">
          {/* Image */}
          <div className="relative w-full h-48">
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          
          {/* Content */}
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags && tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100">
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-xl font-semibold line-clamp-2">{title}</h3>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 flex-grow">
            <p className="text-gray-600 line-clamp-3">{summary}</p>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 text-sm text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <User2 className="h-3 w-3" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
