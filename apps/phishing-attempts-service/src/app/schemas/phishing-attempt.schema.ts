import * as mongoose from 'mongoose';
import { PhishingAttempt } from '@phishing-simulator/shared-types';

export const PhishingAttemptSchema = new mongoose.Schema<PhishingAttempt>({
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  emailContent: {
    type: String,
    required: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['PENDING', 'CLICKED', 'FAILED'],
    default: 'PENDING',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clickedAt: {
    type: Date,
    default: null,
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

PhishingAttemptSchema.index({ recipientEmail: 1 });
PhishingAttemptSchema.index({ status: 1 });
PhishingAttemptSchema.index({ createdBy: 1 });
