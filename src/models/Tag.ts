import mongoose from 'mongoose';

export interface ITag {
  name: string;
  createdAt: Date;
  usageCount: number;
}

// Delete the existing model if it exists
if (mongoose.models.Tag) {
  delete mongoose.models.Tag;
}

const TagSchema = new mongoose.Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  usageCount: {
    type: Number,
    default: 0
  }
});

const Tag = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);

export default Tag; 