import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import { QuizAttempt } from '@/lib/database/models/quiz.model';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const body = await req.json();
      // Calculate quiz results
    const { answers, timeSpent, questionTimes } = body as {
      answers: Record<string, {
        selectedOption: string | null;
        correctOption: string;
        status: string;
      }>;
      timeSpent: number;
      questionTimes: Record<string, number>;
    };
    
    // Fetch the quiz to validate correct answers on server side
    const { Quiz } = await import('@/lib/database/models/quiz.model');
    const quiz = await Quiz.findOne({ id: params.quizId });
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    // Create a map of correct answers for validation
    const correctAnswersMap: { [key: number]: string } = {};
    quiz.questions.forEach((q) => {
      correctAnswersMap[q.id] = q.correctAnswer;
    });      // Get existing quiz attempt or create new one
    let quizAttempt = await QuizAttempt.findOne({
      quizId: params.quizId,
      isCompleted: false
    });
      if (!quizAttempt) {
      // Create a new attempt
      quizAttempt = new QuizAttempt({
        quizId: params.quizId,
        userIds: [userId.toString()], // Add the current user to the userIds array
        userId: userId.toString(), // Also set userId for backward compatibility
        startTime: new Date(Date.now() - (timeSpent * 1000)),
        questionAttempts: []
      });
    } else {
      // Add the user to the userIds array if they're not already there
      if (!quizAttempt.userIds.includes(userId.toString())) {
        quizAttempt.userIds.push(userId.toString());
      }
      // Also update userId field for backward compatibility
      quizAttempt.userId = userId.toString();
    }
    
    // Update the quiz attempt with answers and completion
    quizAttempt.endTime = new Date();
    quizAttempt.isCompleted = true;
    quizAttempt.timeSpent = timeSpent;     
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    
    // Clear existing attempts if any
    quizAttempt.questionAttempts = [];
    
    for (const [questionId, data] of Object.entries(answers)) {
      const { selectedOption, status } = data;
      const qId = parseInt(questionId);
      
      // Use server-side correct answer for validation
      const correctOption = correctAnswersMap[qId] || data.correctOption;
      const isCorrect = selectedOption === correctOption;
        // Get the time spent on this question from the questionTimes object
      // Ensure we handle any type of input - string or number
      const timeSpent = questionTimes && questionTimes[questionId] 
        ? (typeof questionTimes[questionId] === 'string' ? parseInt(questionTimes[questionId]) : questionTimes[questionId])
        : 0;
      
      const questionAttempt = {
        questionId: qId,
        selectedOption: selectedOption || null,
        isCorrect: selectedOption ? isCorrect : null,
        timeSpent: Math.max(0, timeSpent), // Ensure we never have negative time values
        status
      };
      
      quizAttempt.questionAttempts.push(questionAttempt);
        // Count based on selected option and status
      if (selectedOption) {
        if (isCorrect) correctCount++;
        else incorrectCount++;
      } else {
        // Even if no selection, check if it was marked as answered
        if (status === 'answered' || status === 'review-with-answer') {
          // This means the answer was cleared but the question was visited
          incorrectCount++;
        } else {
          unattemptedCount++;
        }
      }
    }
    
    // Update counts and calculate score
    quizAttempt.correctAnswers = correctCount;
    quizAttempt.incorrectAnswers = incorrectCount;
    quizAttempt.unattempted = unattemptedCount;
    
    // Simple scoring: +4 for correct, -1 for incorrect, 0 for unattempted
    const score = (correctCount * 4) - incorrectCount;
    quizAttempt.score = Math.max(0, score); // Ensure score is not negative
    quizAttempt.totalMarks = (correctCount + incorrectCount + unattemptedCount) * 4;
    
    await quizAttempt.save();
    
    return NextResponse.json(
      { 
        message: 'Quiz submitted successfully',
        result: {
          score: quizAttempt.score,
          totalMarks: quizAttempt.totalMarks,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          unattempted: unattemptedCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error submitting quiz ${params.quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
