"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, RefreshCcw } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  onCreateNew: () => void;
  categories: string[];
  difficulties: string[];
  onRefresh: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  onCreateNew,
  categories,
  difficulties,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="min-w-[150px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="truncate">
                  {selectedCategory || "All Categories"}
                </span>
              </div>
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedDifficulty}
            onValueChange={setSelectedDifficulty}
          >
            <SelectTrigger className="min-w-[120px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="truncate">
                  {selectedDifficulty || "All Levels"}
                </span>
              </div>
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          className="aspect-square"
          title="Refresh"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={onCreateNew}
          className="bg-black hover:bg-gray-800 text-white grow sm:grow-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Flashcard
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
