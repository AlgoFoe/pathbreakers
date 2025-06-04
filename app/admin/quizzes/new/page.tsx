"use client";

import dynamic from "next/dynamic";

// Dynamically import the QuizEditor component to avoid issues with direct imports
const QuizEditor = dynamic(() => import("../[id]/page").then((mod) => mod.default), {
  ssr: false,
});

export default function NewQuiz() {
  return <QuizEditor />;
}
