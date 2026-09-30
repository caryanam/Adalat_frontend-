import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationApi } from '../api/consultationApi';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';

// 1. Customer Consultation Requests Query
export const useCustomerRequests = () => {
  return useQuery({
    queryKey: ['customer-requests'],
    queryFn: async () => {
      const res = await consultationApi.getRequestsForCustomer();
      const raw = res && res.data ? (res.data.data || res.data) : [];
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

// 2. Lawyer Consultation Requests Query
export const useLawyerRequests = () => {
  return useQuery({
    queryKey: ['lawyer-requests'],
    queryFn: async () => {
      const res = await consultationApi.getLawyerRequests();
      const raw = res && res.data ? (res.data.data || res.data) : [];
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

// 3. Consultation Messages Query
export const useConsultationMessages = (requestId, isLawyer = false) => {
  return useQuery({
    queryKey: ['consultation-messages', requestId, isLawyer],
    queryFn: async () => {
      if (!requestId) return [];
      const res = isLawyer
        ? await consultationApi.getConsultationMessagesLawyer(requestId)
        : await consultationApi.getConsultationMessagesCustomer(requestId);
      const raw = res && res.data ? (res.data.data || res.data) : [];
      return Array.isArray(raw) ? raw : [];
    },
    enabled: !!requestId,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};

// 4. Complete / Conclude Consultation Mutation (Moves from Active to Closed/Completed Appointments)
export const useCompleteConsultation = (isLawyer = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId) => {
      const endpoint = isLawyer 
        ? `/api/lawyer/consultations/${requestId}/complete`
        : `/api/customer/consultations/${requestId}/complete`;
      const res = await apiClient.post(endpoint);
      return res.data;
    },
    onSuccess: (data, requestId) => {
      toast.success('Consultation concluded successfully! Session moved to Appointments.');
      // Invalidate queries so TanStack Query auto-refetches active lists and appointments
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['consultation-messages', requestId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Could not complete consultation session.');
    }
  });
};
