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

  // 5.1. Rate Consultation
  submitConsultationRating: (requestId, rating, comment) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/rating`, { rating, comment });
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

  rejectLawyerRequest: (requestId, reasonOrActionDTO) => {
    const payload = typeof reasonOrActionDTO === 'string'
      ? { notes: reasonOrActionDTO, reason: reasonOrActionDTO }
      : (reasonOrActionDTO || {});
    return apiClient.post(`/api/lawyer/consultation-requests/${requestId}/reject`, payload);
  },

  // 8. Consultation Chat Messages
  getConsultationMessagesCustomer: (requestId) => {
    return apiClient.get(`/api/customer/consultations/${requestId}/messages`);
  },

  sendConsultationMessageCustomer: (requestId, message, attachment = null) => {
    const payload = {
      text: message,
      message: message,
      attachmentUrl: attachment?.attachmentUrl || attachment?.url || null,
      attachmentName: attachment?.attachmentName || attachment?.name || null,
      attachmentType: attachment?.attachmentType || attachment?.type || null,
      attachmentSize: attachment?.attachmentSize || attachment?.size || null
    };
    return apiClient.post(`/api/customer/consultations/${requestId}/messages`, payload);
  },

  uploadConsultationAttachmentCustomer: (requestId, formData) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/upload-attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  markConsultationMessagesSeenCustomer: (requestId, messageIds) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/messages/seen`, { messageIds }).catch(() => {});
  },

  markConsultationMessagesDeliveredCustomer: (requestId, messageIds) => {
    return apiClient.post(`/api/customer/consultations/${requestId}/messages/delivered`, { messageIds }).catch(() => {});
  },

  getConsultationMessagesLawyer: (requestId) => {
    return apiClient.get(`/api/lawyer/consultations/${requestId}/messages`);
  },

  sendConsultationMessageLawyer: (requestId, message, attachment = null) => {
    const payload = {
      text: message,
      message: message,
      attachmentUrl: attachment?.attachmentUrl || attachment?.url || null,
      attachmentName: attachment?.attachmentName || attachment?.name || null,
      attachmentType: attachment?.attachmentType || attachment?.type || null,
      attachmentSize: attachment?.attachmentSize || attachment?.size || null
    };
    return apiClient.post(`/api/lawyer/consultations/${requestId}/messages`, payload);
  },

  uploadConsultationAttachmentLawyer: (requestId, formData) => {
    return apiClient.post(`/api/lawyer/consultations/${requestId}/upload-attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  markConsultationMessagesSeenLawyer: (requestId, messageIds) => {
    return apiClient.post(`/api/lawyer/consultations/${requestId}/messages/seen`, { messageIds }).catch(() => {});
  },

  markConsultationMessagesDeliveredLawyer: (requestId, messageIds) => {
    return apiClient.post(`/api/lawyer/consultations/${requestId}/messages/delivered`, { messageIds }).catch(() => {});
  }
};
