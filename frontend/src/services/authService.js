import apiClient from './apiClient';

export const authService = {
  /**
   * Log in user
   */
  login: async (email, password) => {
    return await apiClient.post('/auth/login', { email, password });
  },

  /**
   * Register new account
   */
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  /**
   * Fetch currently authenticated profile
   */
  getMe: async () => {
    return await apiClient.get('/auth/me');
  }
};
