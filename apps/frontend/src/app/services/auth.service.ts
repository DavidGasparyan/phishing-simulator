import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../models/user.model';
import { toast } from 'react-toastify';
import apiClient from './api-client';

// Token storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authApiService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const { data } = await apiClient.post<AuthResponse>(`/management/auth/login`, credentials);
      // Log response data for debugging (remove in production)
      console.log('Login API response:', data);

      return data;
    } catch (error: any) {
      console.error('Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const { data } = await apiClient.post<AuthResponse>(`/management/auth/register`, credentials);
      return data;
    } catch (error: any) {
      console.error('Register API error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApiService.login,
    onSuccess: (data: AuthResponse) => {
      console.log('Login successful, storing auth data');

      // Extract the token - check both possibilities based on your API response
      const token = data.access_token;
      const user = data.user;

      if (!token) {
        console.error('No token found in response data:', data);
        toast.error('Authentication error: No token received');
        return;
      }

      // Store auth data in localStorage
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('Token stored in localStorage');
      } catch (e) {
        console.error('Error storing auth data:', e);
        toast.error('Failed to store authentication data');
      }

      // Update any relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success('Login successful!');
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  });
};

// Hook for register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApiService.register,
    onSuccess: (data: AuthResponse) => {
      console.log('Registration successful, storing auth data');

      // Extract the token - check both possibilities based on your API response
      const token = data.access_token;
      const user = data.user;

      if (!token) {
        console.error('No token found in response data:', data);
        toast.error('Authentication error: No token received');
        return;
      }

      // Store auth data in localStorage
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('Token stored in localStorage after registration');
      } catch (e) {
        console.error('Error storing auth data:', e);
        toast.error('Failed to store authentication data');
      }

      // Update any relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      console.error('Registration mutation error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  });
};

// Auth utility functions
export const AuthService = {
  logout: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      console.log('User logged out, auth data cleared');
    } catch (e) {
      console.error('Error during logout:', e);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr) as User;
      }
    } catch (e) {
      console.error('Error getting current user:', e);
      // If there's an error (like corrupt JSON), clear the storage
      localStorage.removeItem(USER_KEY);
    }
    return null;
  },

  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      // Log token status for debugging (remove in production)
      console.log('Token in isAuthenticated check:', token ? 'Present' : 'Missing');

      if (!token) {
        return false;
      }

      // You could add JWT expiration check here if needed

      return true;
    } catch (e) {
      console.error('Error checking authentication:', e);
      return false;
    }
  }
};

export default AuthService;
