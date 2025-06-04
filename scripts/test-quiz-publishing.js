// This script tests the quiz publishing workflow
// It checks if published quizzes are visible to users

const { connectToDatabase } = require('../lib/database/mongoose');
const { Quiz } = require('../lib/database/models/quiz.model');
const { v4: uuidv4 } = require('uuid');

async function testQuizPublishingFlow() {
  try {
    console.log('Starting quiz publishing test...');
    
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');
    
    // Create a test quiz with "live" status
    const testQuizId = `test-quiz-${uuidv4()}`;
    const testQuiz = new Quiz({
      id: testQuizId,
      title: `Test Quiz ${new Date().toISOString()}`,
      date: new Date(),
      duration: 30, // 30 minutes
      questionsCount: 2,
      syllabus: ['Test Subject'],
      status: 'live', // Important: this should be visible to users
      questions: [
        {
          id: 1,
          question: 'Test question 1?',
          options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
          ],
          correctAnswer: 'a',
        },
        {
          id: 2,
          question: 'Test question 2?',
          options: [
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' },
          ],
          correctAnswer: 'c',
        },
      ],
    });
    
    // Save the test quiz
    await testQuiz.save();
    console.log(`Created test quiz with ID: ${testQuizId}`);
    
    // Query for live quizzes (simulating user query)
    const liveQuizzes = await Quiz.find({ status: 'live' })
      .select('id title date duration questionsCount syllabus status');
      
    console.log(`Found ${liveQuizzes.length} live quizzes`);
    
    // Check if our test quiz is in the results
    const foundTestQuiz = liveQuizzes.find(quiz => quiz.id === testQuizId);
    
    if (foundTestQuiz) {
      console.log('SUCCESS: Test quiz was found in live quizzes!');
      console.log('Quiz details:', foundTestQuiz);
    } else {
      console.error('ERROR: Test quiz was not found in live quizzes!');
      console.log('Available live quizzes:', liveQuizzes.map(q => q.id));
    }
    
    // Clean up - delete the test quiz
    await Quiz.findOneAndDelete({ id: testQuizId });
    console.log(`Cleaned up: Deleted test quiz ${testQuizId}`);
    
    console.log('Test completed');
    process.exit(0);
  } catch (error) {
    console.error('Error in test:', error);
    process.exit(1);
  }
}

// Run the test
testQuizPublishingFlow();
