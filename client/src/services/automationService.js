import api from './api';

export const automationService = {
  /**
   * Get white-label branding configuration
   */
  getBranding: async () => {
    const response = await api.get('/branding');
    return response.data;
  },

  /**
   * Update white-label branding (logo, accent color, portal title)
   */
  updateBranding: async (brandingData) => {
    const response = await api.patch('/branding', brandingData);
    return response.data;
  },

  /**
   * Get all automated drip sequences
   */
  getSequences: async () => {
    const response = await api.get('/automations/sequences');
    return response.data;
  },

  /**
   * AI Summarize call notes & auto-extract action items
   */
  summarizeCall: async (customerId, rawNotes) => {
    const response = await api.post('/automations/summarize-call', { customerId, rawNotes });
    return response.data;
  }
};

export default automationService;
