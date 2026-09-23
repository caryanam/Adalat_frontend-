import apiClient from './apiClient';

export const adminApi = {
  // All Lawyers (Pending, Approved, Rejected)
  getAllLawyers: () => {
    return apiClient.get('/api/admin/lawyers').catch(() => {
      return { status: 'SUCCESS', data: [] };
    });
  },

  // Pending & Lawyer Management
  getPendingLawyers: () => {
    return apiClient.get('/api/admin/lawyers/pending').catch(() => {
      return { status: 'SUCCESS', data: [] };
    });
  },

  getLawyerDetails: (lawyerId) => {
    return apiClient.get(`/api/admin/lawyers/${lawyerId}`);
  },

  approveLawyer: (lawyerId) => {
    return apiClient.post(`/api/admin/lawyers/${lawyerId}/approve`);
  },

  rejectLawyer: (lawyerId, rejectionReason) => {
    return apiClient.post(`/api/admin/lawyers/${lawyerId}/reject`, { rejectionReason });
  }
};
