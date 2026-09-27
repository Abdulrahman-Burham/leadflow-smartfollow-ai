import api from './api';

export const projectService = {
  /**
   * Get all projects
   */
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  /**
   * Create a new project
   */
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  /**
   * Update project details
   */
  updateProject: async (id, data) => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};

export default projectService;
