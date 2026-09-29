import apiClient from './apiClient';

/**
 * Health Service Module
 */
export const healthService = {
  /**
   * Fetch backend health status
   * @returns {Promise<Object>} Status response object
   */
  getHealth: async () => {
    return await apiClient.get('/health');
  },
};
