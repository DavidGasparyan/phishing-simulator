export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
