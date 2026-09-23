import apiClient from './apiClient';

export const lawyerApi = {
  // Step 1: Account creation (Name, Email, Mobile, Password)
  registerStep1: (accountData) => {
    return apiClient.post('/api/lawyers/register/step1', accountData);
  },

  // Get saved lawyer registration progress
  getLawyerById: (id) => {
    const validId = id || 1;
    return apiClient.get(`/api/lawyers/register/${validId}`).catch(() => {
      return { status: 'FAIL', data: null, message: 'Lawyer record not found' };
    });
  },

  // Step 2: Professional details
  updateStep2: (lawyerId, profData) => {
    const validId = lawyerId || 1;
    return apiClient.put(`/api/lawyers/register/${validId}/step2`, profData);
  },

  // Step 3: Document Upload (multipart/form-data)
  uploadDocument: (lawyerId, documentType, file) => {
    const validId = lawyerId || 1;
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    return apiClient.post(`/api/lawyers/register/${validId}/step3`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Step 4: Pricing setup (Accepts numeric amount or consultationRate enum)
  updateStep4: (lawyerId, amountOrRate) => {
    const validId = lawyerId || 1;
    let payload = {};
    if (typeof amountOrRate === 'number' || (!isNaN(amountOrRate) && !String(amountOrRate).startsWith('RATE_'))) {
      payload = { amount: parseInt(amountOrRate, 10) || 99 };
    } else {
      payload = { consultationRate: amountOrRate || 'RATE_99' };
    }
    return apiClient.put(`/api/lawyers/register/${validId}/step4`, payload);
  },

  // Step 5: UPI payout setup
  updateStep5: (lawyerId, upiId) => {
    const validId = lawyerId || 1;
    return apiClient.put(`/api/lawyers/register/${validId}/step5`, { upiId });
  },

  // Final Step: Submit for admin verification
  submitApplication: (lawyerId) => {
    const validId = lawyerId || 1;
    return apiClient.put(`/api/lawyers/register/${validId}/submit`);
  },
  submitForVerification: (lawyerId) => {
    const validId = lawyerId || 1;
    return apiClient.put(`/api/lawyers/register/${validId}/submit`);
  },

  // Lawyer Login
  login: (identifier, password) => {
    return apiClient.post('/api/lawyers/login', { identifier, password });
  },

  // Get all approved lawyers (Public directory from DB)
  getApprovedLawyers: () => {
    return apiClient.get('/api/lawyers/register/directory').catch(() => {
      return { status: 'SUCCESS', data: [] };
    });
  },

  // ─── PROFILE & ACCOUNT MANAGEMENT ──────────────────────────────────────────
  
  // Get full lawyer profile
  getProfile: (lawyerId) => {
    const id = lawyerId || 1;
    return apiClient.get(`/api/lawyers/${id}/profile`).catch(() => {
      return apiClient.get('/api/lawyers/profile/me');
    });
  },

  // Update full lawyer profile
  updateProfile: (lawyerId, profileData) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/profile`, profileData);
  },

  // Upload lawyer profile photo
  uploadProfilePhoto: (lawyerId, file) => {
    const id = lawyerId || 1;
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/api/lawyers/${id}/profile-photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Email Change: Send OTP to new email
  sendEmailChangeOtp: (lawyerId, newEmail) => {
    const id = lawyerId || 1;
    return apiClient.post(`/api/lawyers/${id}/email/send-otp`, { newEmail });
  },

  // Email Change: Verify OTP and commit email update
  verifyAndUpdateEmail: (lawyerId, newEmail, otp) => {
    const id = lawyerId || 1;
    return apiClient.post(`/api/lawyers/${id}/email/verify-update`, { newEmail, otp });
  },

  // Change Password & send security email alert
  changePassword: (lawyerId, passwordData) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/change-password`, passwordData);
  },

  // Reset Password with Email OTP (Forgot Password flow)
  resetPasswordWithOtp: (email, newPassword, confirmPassword) => {
    return apiClient.post('/api/lawyers/forgot-password/reset', { email, newPassword, confirmPassword });
  },

  // Modular Updates
  updatePricing: (lawyerId, consultationFee) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/pricing`, { consultationFee });
  },

  updateCategories: (lawyerId, practiceAreas) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/categories`, practiceAreas);
  },

  updateLanguages: (lawyerId, languages) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/languages`, languages);
  },

  updateUpi: (lawyerId, upiId) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/upi`, { upiId });
  },

  updateOverview: (lawyerId, bio) => {
    const id = lawyerId || 1;
    return apiClient.put(`/api/lawyers/${id}/overview`, { bio });
  },

  // Get advocate earnings summary & payout transactions
  getEarnings: (lawyerId) => {
    const id = lawyerId || 1;
    return apiClient.get(`/api/lawyers/${id}/earnings`).catch(() => {
      return apiClient.get('/api/lawyers/earnings/me').catch(() => {
        return { status: 'SUCCESS', data: { totalEarnings: '₹0.00', todayEarnings: '₹0.00', completedConsultations: 0, transactions: [] } };
      });
    });
  },

  // Get dynamic reviews & rating breakdown from database
  getRatings: (lawyerId) => {
    const id = lawyerId || 1;
    return apiClient.get(`/api/lawyers/${id}/ratings`).then(res => {
      return res?.data?.data || res?.data || { averageRating: 0, ratingCount: 0, reviews: [] };
    }).catch(() => {
      return { averageRating: 0, ratingCount: 0, reviews: [] };
    });
  },

  // Submit client rating & feedback directly
  submitRating: (lawyerId, rating, comment, customerName) => {
    const id = lawyerId || 1;
    return apiClient.post(`/api/lawyers/${id}/ratings`, { rating, comment, customerName });
  }
};
