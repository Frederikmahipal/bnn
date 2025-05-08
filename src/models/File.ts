import mongoose, { Document } from 'mongoose';

// Define interfaces for better type safety
interface IAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface IFile extends Document {
  title: string;
  description?: string;
  tags: string[];
  price?: number;
  documentDate: Date;
  fileName?: string;
  attachment?: IAttachment;
  createdAt: Date;
  updatedAt: Date;
}

// Delete the existing model if it exists
if (mongoose.models.File) {
  delete mongoose.models.File;
}

const AttachmentSchema = new mongoose.Schema<IAttachment>({
  name: { type: String },
  type: { type: String },
  size: { type: Number },
  url: { type: String }
}, { _id: false }); // Prevent MongoDB from creating _id for subdocument

const FileSchema = new mongoose.Schema<IFile>({
  // Core document fields
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
    text: true // Enable text search
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
    default: '',
    text: true // Enable text search
  },
  tags: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: undefined,
  },
  documentDate: {
    type: Date,
    default: Date.now,
  },
  fileName: {
    type: String,
    default: undefined,
  },
  
  // File attachment as a subdocument
  attachment: {
    type: AttachmentSchema,
    validate: [
      {
        validator: function(this: mongoose.Document & IFile, attachment: IAttachment | undefined): boolean {
          if (!attachment) return true; // Attachment is optional
          
          // If any attachment field is present, all fields must be present
          const hasAnyField = !!(attachment.name || attachment.type || attachment.size || attachment.url);
          const hasAllFields = !!(attachment.name && attachment.type && attachment.size && attachment.url);
          
          return !hasAnyField || hasAllFields;
        },
        message: 'If any attachment field is provided, all attachment fields (name, type, size, url) must be provided'
      }
    ]
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function(doc: any, ret: any) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better search performance
FileSchema.index({ title: 'text', description: 'text' });
FileSchema.index({ tags: 1 });
FileSchema.index({ documentDate: 1 });
FileSchema.index({ price: 1 });

const FileModel = mongoose.model<IFile>('File', FileSchema);
export default FileModel; 