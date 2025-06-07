import { Schema, model, models, Document } from "mongoose";

export interface IFlashcard extends Document {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  setTitle?: string;
  setDescription?: string;
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    setTitle: {
      type: String,
    },
    setDescription: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Flashcard = models.Flashcard || model<IFlashcard>("Flashcard", FlashcardSchema);

export default Flashcard;
