import api from './api';

export const customerService = {
  /**
   * Get customer list with optional filters
   */
  getCustomers: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  /**
   * Create a new customer lead
   */
  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  /**
   * Update customer stage, notes, or next follow-up date
   */
  updateCustomer: async (id, data) => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Get all follow-up tasks
   */
  getFollowUpTasks: async () => {
    const response = await api.get('/customers/followups/tasks');
    return response.data;
  },

  /**
   * Complete or cancel a follow-up task
   */
  updateTaskStatus: async (taskId, status, notes = '') => {
    const response = await api.patch(`/customers/followups/tasks/${taskId}`, { status, notes });
    return response.data;
  },

  /**
   * Delete a customer lead
   */
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  /**
   * Generate AI suggested message draft
   */
  generateAISuggestion: async (customerId, channel = 'email', promptHint = '') => {
    const response = await api.post(`/customers/${customerId}/ai-suggest`, { channel, promptHint });
    return response.data;
  }
};

export default customerService;
