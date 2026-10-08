import apiClient from './apiClient';

let lawyerRequestsPromise = null;
let customerRequestsPromise = null;

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
    if (customerRequestsPromise) return customerRequestsPromise;
    customerRequestsPromise = apiClient.get('/api/customer/consultations')
      .then(res => {
        const currentUserStr = sessionStorage.getItem('adalat_user') || localStorage.getItem('adalat_user');
        if (currentUserStr && res && res.data) {
          try {
            const user = JSON.parse(currentUserStr);
            const currentCustomerId = user.customerId || user.id;
            if (currentCustomerId) {
              let rawData = res.data.data || res.data;
              if (Array.isArray(rawData)) {
                rawData = rawData.filter(r => {
                  const rId = r.customerId || r.customer?.id || r.customer?.customerId;
                  return !rId || String(rId) === String(currentCustomerId);
                });
                if (res.data.data) {
                  res.data.data = rawData;
                } else {
                  res.data = rawData;
                }
              }
            }
          } catch (e) {}
        }
        return res;
      })
      .catch(() => ({ status: 'SUCCESS', data: [] }))
      .finally(() => { customerRequestsPromise = null; });
    return customerRequestsPromise;
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

  unlockPaidConsultation: (consultationId, paymentId, amount, durationMinutes) => {
    return apiClient.post(`/api/customer/consultations/${consultationId}/unlock`, { paymentId, amount, durationMinutes });
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
    if (lawyerRequestsPromise) return lawyerRequestsPromise;
    lawyerRequestsPromise = apiClient.get('/api/lawyer/consultation-requests')
      .then(res => {
        let currentLawyerId = sessionStorage.getItem('adalat_lawyer_id') || localStorage.getItem('adalat_lawyer_id');
        
        // Fallback: try to extract from user object if ID string is empty
        if (!currentLawyerId) {
          try {
            const userStr = sessionStorage.getItem('adalat_user') || localStorage.getItem('adalat_user');
            if (userStr) {
              const user = JSON.parse(userStr);
              currentLawyerId = user.lawyerId || user.id || user.userId;
            }
          } catch (e) {}
        }

        if (res && res.data) {
          if (!currentLawyerId) {
            // CRITICAL: If no lawyer ID is found, NEVER show other lawyers' requests!
            if (res.data.data) {
              res.data.data = [];
            } else {
              res.data = [];
            }
            return res;
          }

          let rawData = res.data.data || res.data;
          if (Array.isArray(rawData)) {
            rawData = rawData.filter(r => {
              const rId = r.lawyerId || r.lawyer?.id || r.lawyer?.lawyerId;
              return String(rId) === String(currentLawyerId);
            });
            if (res.data.data) {
              res.data.data = rawData;
            } else {
              res.data = rawData;
            }
          }
        }
        return res;
      })
      .catch(() => ({ status: 'SUCCESS', data: [] }))
      .finally(() => { lawyerRequestsPromise = null; });
    return lawyerRequestsPromise;
  },

  acceptLawyerRequest: (requestId, assignedDate, assignedTime, duration) => {
    return apiClient.post(`/api/lawyer/consultation-requests/${requestId}/accept`, { assignedDate, assignedTime, duration, paidDurationMinutes: duration, lawyerDuration: duration }).catch(() => {
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
