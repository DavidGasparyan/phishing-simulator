import * as mongoose from 'mongoose';

export const PhishingAttemptSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  emailContent: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'CLICKED', 'FAILED'],
    default: 'PENDING',
  },
  trackingToken: {
    type: String,
    required: true,
    unique: true,
  },
  clickedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

PhishingAttemptSchema.index({ trackingToken: 1 }, { unique: true });
