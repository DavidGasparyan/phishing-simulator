import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: '/api/',  // Use the root path since you're handling path prefixes in vite.config.ts
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Log token status for debugging (you can remove this in production)
    console.log('Token status in request interceptor:', token ? 'Present' : 'Missing');

    // Only add the Authorization header if the token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle unauthorized errors (missing or invalid token)
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response.data);

      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Your session has expired. Please login again.');
        window.location.href = '/login';
      }
    }

    // Handle server errors
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      toast.error('An unexpected error occurred. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
