import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PhishingAttempt } from '../models/phishing-attempt.model';
import apiClient from './api-client';
import AuthService from './auth.service';

// API endpoints
const MANAGEMENT_API = '/management/phishing-attempts';
const SIMULATION_API = '/simulation/phishing';

// API response types
interface PhishingAttemptsResponse {
  attempts: PhishingAttempt[];
  total: number;
  page: number;
  totalPages: number;
}

// DTO type for sending phishing emails
interface SendPhishingEmailDto {
  recipientEmail: string;
  emailTemplate: string;
  createdBy: string;
}

// API functions
const phishingApiService = {
  getAll: async (): Promise<PhishingAttemptsResponse> => {
    try {
      const { data } = await apiClient.get<PhishingAttemptsResponse>(MANAGEMENT_API);
      return data;
    } catch (error: any) {
      console.error('Error fetching phishing attempts:', error.response?.data || error.message);
      throw error;
    }
  },

  sendPhishingEmail: async (emailData: SendPhishingEmailDto): Promise<PhishingAttempt> => {
    try {
      // Get the current user and add their ID to the request
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && currentUser.id) {
        emailData.createdBy = currentUser.id;
      }

      console.log('Sending phishing email with data:', emailData);
      const { data } = await apiClient.post<PhishingAttempt>(`${SIMULATION_API}/send`, emailData);
      return data;
    } catch (error: any) {
      console.error('Error sending phishing email:', error.response?.data || error.message);
      throw error;
    }
  }
};

// React Query hooks
export const usePhishingAttempts = (options = {}) => {
  return useQuery<PhishingAttemptsResponse>({
    queryKey: ['phishingAttempts'],
    queryFn: phishingApiService.getAll,
    ...options,
    enabled: AuthService.isAuthenticated() // Only fetch if user is authenticated
  });
};

export const useSendPhishingEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: phishingApiService.sendPhishingEmail,
    onSuccess: (newAttempt) => {
      // Invalidate and refetch phishing attempts
      queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });

      // Optionally, update the cache with the new attempt
      queryClient.setQueryData(['phishingAttempts'], (oldData: PhishingAttemptsResponse | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            attempts: [newAttempt, ...oldData.attempts],
            total: oldData.total + 1
          };
        }
        return { attempts: [newAttempt], total: 1, page: 1, totalPages: 1 };
      });

      toast.success('Phishing email sent successfully');
    },
    onError: (error: any) => {
      console.error('Error response:', error.response?.data);
      let errorMessage = 'Failed to send phishing email';

      // Try to extract a more specific error message
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      }

      toast.error(errorMessage);
    }
  });
};

export default phishingApiService;
