import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8082',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT auth token (Tab-isolated via sessionStorage)
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('adalat_token') || localStorage.getItem('adalat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  if (error.response?.status === 401) {
    const reqUrl = (error.config?.url || '').toLowerCase();
    const isLoginAttempt = reqUrl.includes('/auth/login') ||
                           reqUrl.includes('/api/customer/login') ||
                           reqUrl.includes('/api/lawyer/login') ||
                           reqUrl.includes('/api/lawyers/login') ||
                           reqUrl.includes('/api/account/delete');

    // Only trigger session expired modal if it is NOT a regular login credential attempt
    if (!isLoginAttempt) {
      sessionStorage.removeItem('adalat_token');
      localStorage.removeItem('adalat_token');

      const currentPath = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
      const savedRole = (typeof sessionStorage !== 'undefined' && (sessionStorage.getItem('adalat_role') || localStorage.getItem('adalat_role'))) || '';
      
      let detectedRole = 'CUSTOMER';
      if (currentPath.startsWith('/admin') || savedRole === 'ADMIN' || reqUrl.includes('/api/admin')) {
        detectedRole = 'ADMIN';
      } else if (currentPath.startsWith('/lawyer') || savedRole === 'LAWYER' || reqUrl.includes('/api/lawyer')) {
        detectedRole = 'LAWYER';
      } else {
        detectedRole = 'CUSTOMER';
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adalat_session_expired', {
          detail: {
            role: detectedRole,
            path: currentPath,
            message: error.response?.data?.message || 'Your session has expired. Please sign in again.'
          }
        }));
      }
    }
  }
  const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Server request failed';
  const err = new Error(errorMsg);
  err.status = error.response?.status;
  return Promise.reject(err);
});

export default apiClient;
