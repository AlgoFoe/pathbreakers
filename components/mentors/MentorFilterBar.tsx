"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MentorFilterProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const filterVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export default function MentorFilterBar({ 
  categories, 
  onCategorySelect, 
  selectedCategory 
}: MentorFilterProps) {
  return (
    <motion.div 
      className="mb-10"
      variants={filterVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === selectedCategory ? "default" : "outline"}
            className={category === selectedCategory 
              ? "bg-red-700 hover:bg-red-800" 
              : "text-gray-700 hover:bg-gray-100"
            }
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
