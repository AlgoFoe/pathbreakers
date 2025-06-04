import { Schema, model, models, Document } from "mongoose";

export interface IStudyMaterial extends Document {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  uploadDate: Date;
  thumbnailUrl?: string;
  createdBy: Schema.Types.ObjectId;
}

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    thumbnailUrl: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const StudyMaterial = models.StudyMaterial || model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema);

export default StudyMaterial;
