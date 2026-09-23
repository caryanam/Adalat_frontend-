import apiClient from './apiClient';

export const accountApi = {
  /**
   * Permanently delete account and all associated user data
   * @param {{ email: string, password: string }} credentials 
   */
  deleteAccount: async (credentials) => {
    try {
      // Send DELETE request with payload in request body
      return await apiClient.delete('/api/account/delete', { data: credentials });
    } catch (err) {
      // Fallback to POST endpoint if client/environment drops DELETE body
      if (err?.status === 405 || err?.status === 400 || err?.message?.includes('body')) {
        return await apiClient.post('/api/account/delete', credentials);
      }
      throw err;
    }
  }
};
