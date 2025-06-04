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
import { useUser } from "@clerk/nextjs";

interface BlogFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  onCreateNew: () => void;
  tags: string[];
  onRefresh: () => void;
}

const BlogFilterBar: React.FC<BlogFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  onCreateNew,
  tags,
  onRefresh,
}) => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full text-black">
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={selectedTag}
            onValueChange={setSelectedTag}
          >
            <SelectTrigger className="min-w-[150px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="truncate">
                  {selectedTag === "all" ? "All Tags" : selectedTag}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
        <div className="flex gap-2 w-full sm:w-auto">        
        {isAdmin && (
          <>
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
              <Plus className="h-4 w-4 mr-2" /> Create Blog
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogFilterBar;
