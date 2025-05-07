import axios from '../config/axios';

export interface Assignment {
  id?: number;
  projectId: number;
  collaboratorId: number;
  role: string;
  notes?: string;
  // Champs enrichis
  collaborator: {
    name: string;
    email: string;
    role: string;
  };
  project: {
    name: string;
    description: string;
    client: string;
    status: string;
    startDate: string;
    endDate: string;
    active: boolean;
  };
  collaboratorName?: string;
  projectName?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectStatus?: string;
  projectActive?: boolean;
}

const assignmentService = {
  getAll: async (): Promise<Assignment[]> => {
    const response = await axios.get<Assignment[]>('/api/assignments');
    return response.data;
  },

  getById: async (id: number): Promise<Assignment> => {
    const response = await axios.get<Assignment>(`/api/assignments/${id}`);
    return response.data;
  },

  create: async (assignment: Assignment): Promise<Assignment> => {
    try {
      const response = await axios.post<Assignment>('/api/assignments', assignment);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Impossible de créer l\'affectation. Vérifiez que le projet et le collaborateur sont actifs.');
      }
      throw error;
    }
  },

  update: async (id: number, assignment: Assignment): Promise<Assignment> => {
    const response = await axios.put<Assignment>(`/api/assignments/${id}`, assignment);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/api/assignments/${id}`);
  },

  getByProject: async (projectId: number) => {
    const response = await axios.get<Assignment[]>(`/api/assignments/project/${projectId}`);
    return response.data;
  },

  getByCollaborator: async (collaboratorId: number) => {
    const response = await axios.get<Assignment[]>(`/api/assignments/collaborator/${collaboratorId}`);
    return response.data;
  },

  getActive: async () => {
    const response = await axios.get<Assignment[]>('/api/assignments/active');
    return response.data;
  },

  removeCollaboratorFromProject: async (assignmentId: number): Promise<void> => {
    await axios.put(`/api/assignments/${assignmentId}/remove`);
  },

  removeCollaboratorsFromProject: async (projectId: number, collaboratorIds: number[]): Promise<void> => {
    await axios.put(`/api/assignments/project/${projectId}/remove-collaborators`, { collaboratorIds });
  },

  removeAllCollaboratorsFromProject: async (projectId: number): Promise<void> => {
    await axios.put(`/api/assignments/project/${projectId}/remove-all`);
  },

  removeCollaboratorFromAllProjects: async (collaboratorId: number): Promise<void> => {
    await axios.put(`/api/assignments/collaborator/${collaboratorId}/remove-all`);
  },

  getRemovalStatistics: async () => {
    const response = await axios.get<{
      activeAssignments: number;
      endingSoon: number;
      collaboratorsToBeReleased: number;
    }>('/api/assignments/removal-stats');
    return response.data;
  },

  canRemoveCollaborator: async (collaboratorId: number): Promise<boolean> => {
    const response = await axios.get<boolean>(`/api/assignments/collaborator/${collaboratorId}/can-remove`);
    return response.data;
  },

  deactivate: async (id: number): Promise<Assignment> => {
    const response = await axios.put<Assignment>(`/api/assignments/${id}/deactivate`);
    return response.data;
  },

  reactivate: async (id: number): Promise<Assignment> => {
    const response = await axios.put<Assignment>(`/api/assignments/${id}/reactivate`);
    return response.data;
  },
};

export default assignmentService; 