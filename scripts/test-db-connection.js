import { connectToDatabase } from '../lib/database/mongoose.js';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const connection = await connectToDatabase();
    console.log('Successfully connected to MongoDB!');
    console.log('Connection object:', connection);
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
