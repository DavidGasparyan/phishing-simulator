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
}

export interface CreatePhishingAttemptDto {
  email: string;
  subject?: string;
  content?: string;
}
