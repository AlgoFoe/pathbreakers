"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryCardProps {
  category: string;
  count: number;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, count, onClick }) => {
  // Get a consistent color based on the category name
  const getColorClass = (str: string) => {
    const colors = [
      "bg-red-100 text-red-800 hover:bg-red-200",
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-green-100 text-green-800 hover:bg-green-200",
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      "bg-teal-100 text-teal-800 hover:bg-teal-200"
    ];
    
    // Simple hash function to get a consistent index
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const colorClass = getColorClass(category);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer ${colorClass} border-none shadow-md h-full`}
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">{category}</CardTitle>
            <Badge variant="outline" className="bg-white bg-opacity-70 backdrop-blur-sm">
              {count} {count === 1 ? 'card' : 'cards'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center pt-2 pb-6">
          <BookOpen className="h-12 w-12 opacity-60" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
