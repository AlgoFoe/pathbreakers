import mongoose, { Schema } from "mongoose";

// Question option schema
const QuestionOptionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

// Question schema for question bank
const QuestionSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [QuestionOptionSchema],
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  explanation: { type: String },
  tags: [{ type: String }]
});

// Question bank schema
const QuestionBankSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  subject: { type: String },
  questionsCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["draft", "published"],
    default: "draft"
  },
  questions: [QuestionSchema],
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const QuestionBank = mongoose.models.QuestionBank || mongoose.model("QuestionBank", QuestionBankSchema);

export default QuestionBank;
