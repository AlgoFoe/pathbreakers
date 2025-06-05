import React from 'react'
import { Metadata } from 'next'
import { getFlashcards } from '@/lib/actions/flashcard.actions'
import FlashcardsClient from './flashcards-client'

export const metadata: Metadata = {
  title: 'Flashcards | Pathbreakers',
  description: 'Create and review flashcards to enhance your learning',
}

const FlashcardsPage = async () => {
  // Server-side fetch initial flashcards data
  const initialFlashcards = await getFlashcards()
  
  // Extract unique categories from flashcards for filters
  const categories = Array.from(
    new Set(initialFlashcards.map((card: any) => card.category))
  ) as string[]
  
  // Difficulties are predefined in our schema
  const difficulties = ["easy", "medium", "hard"]
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FlashcardsClient 
        initialFlashcards={initialFlashcards}
        categories={categories}
        difficulties={difficulties}
      />
    </div>
  )
}

export default FlashcardsPage
