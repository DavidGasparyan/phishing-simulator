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
    enum: ['PENDING', 'CLICKED', 'FAILED', 'SENT'],
    default: 'PENDING',
  },
  trackingToken: {
    type: String,
    required: false,
    unique: false,
  },
  clickedAt: {
    type: Date,
    default: null,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
