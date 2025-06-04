"use client";

import dynamic from "next/dynamic";

// Dynamically import the BlogEditor component to avoid issues with direct imports
const BlogEditor = dynamic(() => import("../[id]/BlogEditor"), {
  ssr: false,
});

export default function NewBlog() {
  return <BlogEditor />;
}
