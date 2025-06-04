import { Schema, model, models, Document } from "mongoose";

export interface IFlashcard extends Document {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  createdBy: Schema.Types.ObjectId;
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Flashcard = models.Flashcard || model<IFlashcard>("Flashcard", FlashcardSchema);

export default Flashcard;
