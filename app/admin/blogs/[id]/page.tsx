"use client";

import dynamic from "next/dynamic";

// Dynamically import the BlogEditor component to avoid issues with direct imports
const BlogEditor = dynamic(() => import("./BlogEditor"), {
  ssr: false,
});

export default function BlogEditPage({ params }: { params: { id: string } }) {
  return <BlogEditor params={params} />;
}
