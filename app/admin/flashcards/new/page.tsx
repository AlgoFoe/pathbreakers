"use client";

import dynamic from "next/dynamic";

// Dynamically import the FlashcardEditor component to avoid issues with direct imports
const FlashcardEditor = dynamic(() => import("../[id]/page").then((mod) => mod.default), {
  ssr: false,
});

export default function NewFlashcardSet() {
  return <FlashcardEditor />;
}
