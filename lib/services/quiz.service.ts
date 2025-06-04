// Quiz service for admin operations
import { v4 as uuidv4 } from 'uuid';

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    formula?: string;
  }[];
  correctAnswer: string;
}

export interface QuizData {
  id?: string;
  title: string;
  category: string;
  questionsCount: number;
  duration: number; // in minutes
  status: "live" | "archived" | "upcoming";
  createdAt: string;
  syllabus?: string[];
  questions?: QuizQuestion[];
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const QuizService = {
  // Get all quizzes
  async getQuizzes() {
    try {
      const response = await fetch(`${API_URL}/api/admin/quizzes`);
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Get quiz by ID
  async getQuizById(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/quizzes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },
  // Create a new quiz
  async createQuiz(quizData: QuizData) {
    try {
      console.log("QuizService.createQuiz called with:", quizData);
      // Generate unique ID if not provided
      if (!quizData.id) {
        quizData.id = uuidv4();
        console.log("Generated new quiz ID:", quizData.id);
      }

      const apiUrl = `${API_URL}/api/admin/quizzes`;
      console.log("Sending POST request to:", apiUrl);      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizData),
        });

        console.log("API response status:", response.status);
        
        if (!response.ok) {
          let errorDetails = "Unknown error";
          try {
            const errorText = await response.text();
            console.error("API error response:", errorText);
            errorDetails = errorText;
          } catch (e) {
            console.error("Failed to read error response:", e);
          }
          throw new Error(`Failed to create quiz: ${response.status} ${errorDetails}`);
        }

        const result = await response.json();
        console.log("Quiz created successfully:", result);
        return result;
      } catch (fetchError) {
        console.error("Network error during quiz creation:", fetchError);
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : "Failed to connect to API"}`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update an existing quiz
  async updateQuiz(id: string, quizData: Partial<QuizData>) {
    try {
      const response = await fetch(`${API_URL}/api/admin/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete a quiz
  async deleteQuiz(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/quizzes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Change quiz status (upcoming, live, archived)
  async updateQuizStatus(id: string, status: "upcoming" | "live" | "archived") {
    try {
      const response = await fetch(`${API_URL}/api/admin/quizzes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating quiz status:', error);
      throw error;
    }
  },

  // Get quiz attempt statistics for admin
  async getQuizAttemptStats(quizId: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/quizzes/${quizId}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      throw error;
    }
  }
};

export default QuizService;
