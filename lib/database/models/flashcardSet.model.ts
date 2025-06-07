import { Schema, model, models, Document } from "mongoose";

export interface IFlashcardSet extends Document {
  title: string;
  description?: string;
  flashcards: {
    question: string;
    answer: string;
    difficulty: string;
  }[];
  category: string;
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSetSchema = new Schema<IFlashcardSet>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    flashcards: [{
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
    }],
    category: {
      type: String,
      required: true,
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

const FlashcardSet = models.FlashcardSet || model<IFlashcardSet>("FlashcardSet", FlashcardSetSchema);

export default FlashcardSet;
