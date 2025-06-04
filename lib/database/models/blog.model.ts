import { Schema, model, models, Document } from "mongoose";
import mongoose from "mongoose";

// Explicitly define the schema without using generic type to avoid type inference issues
export interface IBlog extends Document {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  authorId: string;  // Renamed to authorId to avoid confusion with ref
  slug: string;
  tags: string[];
  category?: string;
  published: boolean;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  scheduledPublishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    authorId: {  
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    tags: [{
      type: String,
    }],
    category: {
      type: String,
      default: 'Uncategorized',
    },
    published: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    scheduledPublishDate: {
      type: Date,
    }
  },
  { timestamps: true }
);

// Create a text index for searching
BlogSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });

// Generate slug from title (if not provided)
BlogSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Use existing model if it exists to prevent OverwriteModelError during hot reloading
const Blog = (models.Blog as mongoose.Model<IBlog>) || model<IBlog>("Blog", BlogSchema);

export default Blog;
