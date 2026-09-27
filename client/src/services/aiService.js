import api from './api';

const aiService = {
    // Executive Briefing
    getExecutiveBriefing: async () => {
        const response = await api.post('/v1/ai/executive-briefing');
        return response.data;
    },

    // Agent Action Dispatcher
    runAgentAction: async (actionType, payload = {}) => {
        const response = await api.post('/v1/ai/agent-action', { actionType, payload });
        return response.data;
    },

    // AI Config Management
    getConfig: async () => {
        const response = await api.get('/v1/ai/config');
        return response.data;
    },

    updateConfig: async (config) => {
        const response = await api.post('/v1/ai/config', config);
        return response.data;
    },

    testKey: async (config) => {
        const response = await api.post('/v1/ai/test-key', config);
        return response.data;
    }
};

export default aiService;
