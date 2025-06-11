// Question Bank service for admin and user operations
import { v4 as uuidv4 } from 'uuid';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string;
  tags?: string[];
}

export interface QuestionBankData {
  id?: string;
  title: string;
  description?: string;
  category: string;
  subject?: string;
  questionsCount: number;
  status: 'draft' | 'published';
  questions?: Question[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

let API_URL;
if (process.env.NEXT_PUBLIC_APP_URL) {
API_URL = process.env.NEXT_PUBLIC_APP_URL;
} else if (process.env.VERCEL_URL) {
API_URL =`https://${process.env.VERCEL_URL}`;
} else {
API_URL = 'http://localhost:3000';
}
export const QuestionBankService = {
  // Get all question banks (for both admin and users)
  async getQuestionBanks(isAdmin: boolean = false) {
    try {
      const endpoint = isAdmin 
        ? `${API_URL}/api/admin/question-banks` 
        : `${API_URL}/api/question-banks`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch question banks');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching question banks:', error);
      throw error;
    }
  },

  // Get question bank by ID
  async getQuestionBankById(id: string, isAdmin: boolean = false) {
    try {
      const endpoint = isAdmin 
        ? `${API_URL}/api/admin/question-banks/${id}` 
        : `${API_URL}/api/question-banks/${id}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch question bank');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching question bank:', error);
      throw error;
    }
  },

  // Create a new question bank (admin only)
  async createQuestionBank(questionBankData: QuestionBankData) {
    try {
      // Generate unique ID if not provided
      if (!questionBankData.id) {
        questionBankData.id = uuidv4();
      }

      const response = await fetch(`${API_URL}/api/admin/question-banks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionBankData),
      });

      if (!response.ok) {
        throw new Error('Failed to create question bank');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating question bank:', error);
      throw error;
    }
  },

  // Update an existing question bank (admin only)
  async updateQuestionBank(id: string, questionBankData: Partial<QuestionBankData>) {
    try {
      const response = await fetch(`${API_URL}/api/admin/question-banks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionBankData),
      });

      if (!response.ok) {
        throw new Error('Failed to update question bank');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating question bank:', error);
      throw error;
    }
  },

  // Delete a question bank (admin only)
  async deleteQuestionBank(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/question-banks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question bank');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting question bank:', error);
      throw error;
    }
  },

  // Update question bank status (draft/published) - admin only
  async updateQuestionBankStatus(id: string, status: 'draft' | 'published') {
    try {
      const response = await fetch(`${API_URL}/api/admin/question-banks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update question bank status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating question bank status:', error);
      throw error;
    }
  },

  // Add a question to a question bank (admin only)
  async addQuestion(bankId: string, question: Question) {
    try {
      // Generate unique ID if not provided
      if (!question.id) {
        question.id = uuidv4();
      }

      const response = await fetch(`${API_URL}/api/admin/question-banks/${bankId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  // Update a question in a question bank (admin only)
  async updateQuestion(bankId: string, questionId: string, question: Partial<Question>) {
    try {
      const response = await fetch(`${API_URL}/api/admin/question-banks/${bankId}/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete a question from a question bank (admin only)
  async deleteQuestion(bankId: string, questionId: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/question-banks/${bankId}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }
};

export default QuestionBankService;
