export type PhishingAttemptStatus = 'NEW' | 'SENT' | 'CLICKED';

export interface PhishingAttempt {
  id: string;
  email: string;
  subject?: string;
  content?: string;
  status: PhishingAttemptStatus;
  createdAt: string;
  updatedAt: string;
  clickedAt?: string;
  sentAt?: string;
  recipientEmail?: string;
  emailContent?: string;
}

export interface CreatePhishingAttemptDto {
  recipientEmail: string;
  emailTemplate: string;
}
