"use client";

import { useMemo } from "react";

interface WordCounterProps {
  content: string;
}

const WordCounter: React.FC<WordCounterProps> = ({ content }) => {
  const stats = useMemo(() => {
    // Remove HTML tags, then count
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.replace(/\s+/g, '').length;
    
    // Estimate reading time (average reading speed: 200 words per minute)
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
    
    return { words, chars, readingTimeMinutes };
  }, [content]);
  
  return (
    <div className="flex gap-4 text-xs text-gray-500">
      <div>{stats.words} {stats.words === 1 ? 'word' : 'words'}</div>
      <div>{stats.chars} {stats.chars === 1 ? 'character' : 'characters'}</div>
      <div>~{stats.readingTimeMinutes} min read</div>
    </div>
  );
};

export default WordCounter;
