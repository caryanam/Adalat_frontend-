import apiClient from './apiClient';

export const consultationApi = {
  // 1. Direct Consultation Booking
  createConsultation: (data) => {
    return apiClient.post('/api/customer/consultations', data);
  },

  // 2. Customer Consultations List
  getMyConsultations: (status) => {
    return apiClient.get('/api/customer/consultations', { params: { status } });
  },

  getRequestsForCustomer: () => {
    return apiClient.get('/api/customer/consultations').catch(() => {
      return { status: 'SUCCESS', data: [] };
    });
  },

  // 3. Consultation Detail
  getConsultationDetail: (requestId) => {
    return apiClient.get(`/api/customer/consultations/${requestId}`);
  },

  // 4. Consultation Payment
  initiatePayment: (requestId) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/payment/initiate`);
  },

  verifyPayment: (requestId, verifyData) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/payment/verify`, verifyData);
  },

  unlockPaidConsultation: (consultationId, paymentId, amount) => {
    return apiClient.post(`/api/customer/consultations/${consultationId}/unlock`, { paymentId, amount });
  },

  // 5. Complete Consultation
  completeConsultationCustomer: (requestId) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/complete`);
  },

  // 6. Appointment Confirmation
  confirmAppointment: (requestId, action) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/confirm?action=${action}`).catch(() => {
      return { status: 'SUCCESS', data: { requestId, action } };
    });
  },

  // 7. Lawyer Consultation Request Actions
  getLawyerRequests: () => {
    return apiClient.get('/api/lawyer/consultation-requests').catch(() => {
      return { status: 'SUCCESS', data: [] };
    });
  },

  acceptLawyerRequest: (requestId, assignedDate, assignedTime) => {
    return apiClient.post(`/api/lawyer/consultation-requests/${requestId}/accept`, { assignedDate, assignedTime }).catch(() => {
      return { status: 'SUCCESS', data: { requestId } };
    });
  },

  rejectLawyerRequest: (requestId, actionDTO) => {
    return apiClient.post(`/api/lawyer/consultation-requests/${requestId}/reject`, actionDTO).catch(() => {
      return { status: 'SUCCESS', data: { requestId } };
    });
  },

  // 8. Consultation Chat Messages
  getConsultationMessagesCustomer: (requestId) => {
    return apiClient.get(`/api/customer/consultations/${requestId}/messages`);
  },

  sendConsultationMessageCustomer: (requestId, message) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/messages`, { text: message, message });
  },

  getConsultationMessagesLawyer: (requestId) => {
    return apiClient.get(`/api/lawyer/consultations/${requestId}/messages`);
  },

  sendConsultationMessageLawyer: (requestId, message) => {
    return apiClient.post(`/api/lawyer/consultations/${requestId}/messages`, { text: message, message });
  }
};
