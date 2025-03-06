import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PhishingAttempt, CreatePhishingAttemptDto } from '../models/phishing-attempt.model';
import apiClient from './api-client';

// API endpoints
const MANAGEMENT_API = '/api/management/phishing-attempts';
const SIMULATION_API = '/api/simulation/phishing';

// API functions
const phishingApiService = {
  getAll: async (): Promise<PhishingAttempt[]> => {
    const { data } = await apiClient.get<PhishingAttempt[]>(MANAGEMENT_API);
    return data;
  },

  getById: async (id: string): Promise<PhishingAttempt> => {
    const { data } = await apiClient.get<PhishingAttempt>(`${MANAGEMENT_API}/${id}`);
    return data;
  },

  create: async (attempt: CreatePhishingAttemptDto): Promise<PhishingAttempt> => {
    const { data } = await apiClient.post<PhishingAttempt>(MANAGEMENT_API, attempt);
    return data;
  },

  sendPhishingEmail: async (id: string): Promise<PhishingAttempt> => {
    const { data } = await apiClient.post<PhishingAttempt>(`${SIMULATION_API}/send`, { id });
    return data;
  }
};

// React Query hooks
export const usePhishingAttempts = (options = {}) => {
  return useQuery({
    queryKey: ['phishingAttempts'],
    queryFn: phishingApiService.getAll,
    ...options
  });
};

export const usePhishingAttempt = (id: string, options = {}) => {
  return useQuery({
    queryKey: ['phishingAttempt', id],
    queryFn: () => phishingApiService.getById(id),
    enabled: !!id,
    ...options
  });
};

export const useCreatePhishingAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: phishingApiService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
      toast.success('Phishing attempt created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create phishing attempt');
    }
  });
};

export const useSendPhishingEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: phishingApiService.sendPhishingEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
      toast.success('Phishing email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send phishing email');
    }
  });
};
