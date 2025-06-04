"use server";

import { revalidatePath } from "next/cache";

export interface FlashcardData {
  id?: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

export async function getFlashcards(params?: {
  category?: string;
  difficulty?: string;
  query?: string;
}) {  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.query) queryParams.append("query", params.query);
    
    const queryString = queryParams.toString();
    
    // Simplify URL construction like the quiz API
    const url = `/api/flashcards${queryString ? `?${queryString}` : ''}`;
    
    // Make API call
    const response = await fetch(
      url,
      { cache: 'no-store' } // Disable caching
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flashcards: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
}

export async function createFlashcard(data: FlashcardData) {  try {
    // Simplify URL construction like the quiz API
    const url = '/api/flashcards';
    
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create flashcard');
    }
    
    const result = await response.json();
    revalidatePath('/dashboard/flashcards');
    return result.data;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    throw error;
  }
}

export async function updateFlashcard(id: string, data: FlashcardData) {  try {
    // Simplify URL construction like the quiz API
    const url = `/api/flashcards/${id}`;
    
    const response = await fetch(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update flashcard');
    }
    
    const result = await response.json();
    revalidatePath('/dashboard/flashcards');
    return result.data;
  } catch (error) {
    console.error("Error updating flashcard:", error);
    throw error;
  }
}

export async function deleteFlashcard(id: string) {  try {
    // Simplify URL construction like the quiz API
    const url = `/api/flashcards/${id}`;
    
    const response = await fetch(
      url,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete flashcard');
    }
    
    const result = await response.json();
    revalidatePath('/dashboard/flashcards');
    return result.data;
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    throw error;
  }
}
