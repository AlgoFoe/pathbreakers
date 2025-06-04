"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export interface FlashcardData {
  id?: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

// Helper function to get the base URL for API calls
function getBaseUrl() {
  // Get the host from the request headers
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
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
    
    const queryString = queryParams.toString();    // Get the base URL for API calls
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/flashcards${queryString ? `?${queryString}` : ''}`;
    
    console.log("Fetching flashcards from:", url);
    
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

export async function createFlashcard(data: FlashcardData) {  try {    // Get the base URL for API calls
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/flashcards`;
    
    console.log("Creating flashcard at:", url);
    
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

export async function updateFlashcard(id: string, data: FlashcardData) {  try {    // Get the base URL for API calls
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/flashcards/${id}`;
    
    console.log("Updating flashcard at:", url);
    
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

export async function deleteFlashcard(id: string) {
  try {    // Get the base URL for API calls
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/flashcards/${id}`;
    
    console.log("Deleting flashcard at:", url);
    
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
