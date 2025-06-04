import mongoose, { Schema } from "mongoose";

// Quiz schema
const QuestionOptionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  formula: { type: String },
});

const QuestionSchema = new Schema({
  id: { type: Number, required: true },
  question: { type: String, required: true },
  options: [QuestionOptionSchema],
  correctAnswer: { type: String, required: true },
});

const QuizSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  questionsCount: { type: Number, required: true },
  syllabus: [{ type: String }],
  status: { 
    type: String, 
    enum: ["upcoming", "live", "archived"],
    default: "upcoming"
  },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Quiz attempt schema
const QuestionAttemptSchema = new Schema({
  questionId: { type: Number, required: true },
  selectedOption: { type: String },
  isCorrect: { type: Boolean },
  timeSpent: { type: Number, default: 0 }, // in seconds
  status: { 
    type: String,
    enum: ["not-visited", "answered", "un-answered", "review", "review-with-answer"],
    default: "not-visited"
  }
});

const QuizAttemptSchema = new Schema({
  quizId: { type: String, required: true },
  userIds: [{ type: String }], 
  userId: { type: String, required: false }, 
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  isCompleted: { type: Boolean, default: false },
  score: { type: Number },
  totalMarks: { type: Number },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  unattempted: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // in seconds
  questionAttempts: [QuestionAttemptSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);

export { Quiz, QuizAttempt };
