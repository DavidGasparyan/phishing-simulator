import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../models/user.model';
import { toast } from 'react-toastify';
import apiClient from './api-client';

const API_URL = '/api/management/auth';

const authApiService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(`${API_URL}/login`, credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(`${API_URL}/register`, credentials);
    return data;
  }
};

// Hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApiService.login,
    onSuccess: (data) => {
      // Store auth data in localStorage
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update any relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  });
};

// Hook for register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApiService.register,
    onSuccess: (data) => {
      // Store auth data in localStorage
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update any relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  });
};

// Auth utility functions
export const AuthService = {
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    return null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

export default AuthService;
