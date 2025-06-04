// scripts/fix-user-ids.js
// This script converts any ObjectId userId fields to strings in QuizAttempt documents
// Run with: node scripts/fix-user-ids.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('Missing MONGODB_URL environment variable');
  process.exit(1);
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL, {
      dbName: 'pathbreakers'
    });
    console.log('Connected to MongoDB');

    // Define the QuizAttempt model schema
    const QuizAttemptSchema = new mongoose.Schema({
      quizId: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.Mixed }, // Use Mixed type to match any existing type
      startTime: { type: Date },
      endTime: { type: Date },
      isCompleted: { type: Boolean },
      questionAttempts: [{ type: mongoose.Schema.Types.Mixed }],
      // ... other fields not needed for the migration
    });
    
    // Check if model already exists to prevent overwriting
    const QuizAttempt = mongoose.models.QuizAttempt || 
      mongoose.model('QuizAttempt', QuizAttemptSchema);

    console.log('Looking for QuizAttempt documents...');
    const attempts = await QuizAttempt.find({});
    console.log(`Found ${attempts.length} QuizAttempt documents`);

    let updatedCount = 0;
    for (const attempt of attempts) {
      if (attempt.userId && attempt.userId.toString) {
        const userId = attempt.userId.toString();
        
        // Only update if necessary (if userId is an ObjectId)
        if (typeof attempt.userId !== 'string') {
          console.log(`Converting userId ${userId} from ObjectId to String`);
          attempt.userId = userId;
          await attempt.save();
          updatedCount++;
        }
      }
    }

    console.log(`Updated ${updatedCount} documents`);
    console.log('Migration complete');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

main();
