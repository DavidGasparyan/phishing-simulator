export interface PhishingAttempt {
  id?: string;
  recipientEmail: string;
  emailContent: string;
  status: 'PENDING' | 'SENT' | 'CLICKED' | 'FAILED';
  trackingToken: string;
  sentAt?: Date;
  clickedAt?: Date;
  createdBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id?: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface CreatePhishingAttemptDto {
  recipientEmail: string;
  emailTemplate: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}
