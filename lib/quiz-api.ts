// This file contains functions that will be used across the quiz system
// to interact with the API endpoints

/**
 * Fetch all quizzes from the API
 * @returns {Promise<Array>} Array of quiz objects
 */
export const fetchQuizzes = async () => {
  try {
    const response = await fetch('/api/quizzes');
      
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    
    const data = await response.json();
    console.log('Fetched quizzes data:', data); // Add logging to help debug
    
    // Ensure we always return an array, even if the API response is malformed
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data for quizzes, converting to empty array');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

/**
 * Fetch user's attempted quizzes
 * @returns {Promise<Array>} Array of attempted quiz data with scores
 */
export const fetchAttemptedQuizzes = async () => {
  try {
    const response = await fetch('/api/quizzes/attempts');
      
    if (!response.ok) {
      throw new Error('Failed to fetch attempted quizzes');
    }
    
    const attempts = await response.json();
    return attempts;
  } catch (error) {
    console.error('Error fetching attempted quizzes:', error);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetch a specific quiz by ID
 * @param {string} quizId - The ID of the quiz to fetch
 * @returns {Promise<Object>} The quiz object
 */
export const fetchQuizById = async (quizId: string) => {
  try {
    const response = await fetch(`/api/quizzes/${quizId}`);
      
    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Submit quiz answers
 * @param {string} quizId - The ID of the quiz being submitted
 * @param {Object} answers - The answers to submit
 * @param {number} timeSpent - The time spent on the quiz in seconds
 * @returns {Promise<Object>} The submission result
 */
/**
 * Determine a quiz's status based on date and user attempts
 * @param {Object} quiz - The quiz object
 * @param {Array} attemptedQuizIds - Array of quiz IDs the user has attempted
 * @returns {string} Status of the quiz: "upcoming", "live", "attempted", or "missed"
 */
export const determineQuizStatus = (quiz: any, attemptedQuizIds: string[] = []) => {
  // First check if the quiz has been attempted by the user
  if (attemptedQuizIds && Array.isArray(attemptedQuizIds) && attemptedQuizIds.includes(quiz.id)) {
    return "attempted";
  }

  // For testing purposes use the status from the database directly
  // This enables viewing quizzes even if dates are in the future
  if (quiz.status === "live") {
    return "live";
  }
  
  const now = new Date();
  const quizDate = new Date(quiz.date);
  const quizEndTime = new Date(quizDate.getTime() + quiz.duration * 60000); // Add duration in minutes
  
  // If the quiz is in the past and hasn't been attempted
  if (quizEndTime < now) {
    return "missed";
  }
  
  // If the quiz date is in the past but end time hasn't passed yet
  if (quizDate <= now && quizEndTime >= now) {
    return "live";
  }
  
  // If the quiz is in the future
  return "upcoming";
};

export const submitQuizAnswers = async (quizId: string, answers: Record<number, string>, timeSpent: number) => {
  try {
    const submissionData = {
      answers,
      timeSpent,
      questionTimes: {} // We could track time per question if needed
    };
    
    const response = await fetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit quiz');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error submitting quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Fetch quiz results
 * @param {string} quizId - The ID of the quiz to get results for
 * @returns {Promise<Object>} The quiz results
 */
export const fetchQuizResult = async (quizId: string) => {
  try {
    const response = await fetch(`/api/quizzes/${quizId}/result`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quiz result');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching quiz result ${quizId}:`, error);
    throw error;
  }
};
