import api from '../config/axios';
import { authService } from './authService';

export enum ProjectStatus {
  EN_DEMARRAGE = 'EN_DEMARRAGE',
  EN_COURS = 'EN_COURS',
  EN_PAUSE = 'EN_PAUSE',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

export interface Skill {
  id: number;
  name: string;
}

export interface ProjectResponse {
  id?: number;
  name: string;
  description: string;
  client: string;
  projectManager: string;
  startDate: Date;
  endDate: Date;
  teamSize: number;
  skills: Skill[];
  skillNames?: Set<string>;
  skillIds?: number[];
  status: ProjectStatus;
  progress?: number;
  assignments?: any[];
  active: boolean;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  client: string;
  projectManager: string;
  startDate: Date;
  endDate: Date;
  teamSize: number;
  skills: string[];
  status: ProjectStatus;
  progress?: number;
  assignments?: any[];
  active: boolean;
}

const projectService = {
  getAll: async () => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<ProjectResponse[]>('/api/projects/all');
      return response.data.map(project => ({
        ...project,
        skills: project.skillNames ? Array.from(project.skillNames) : project.skills?.map(skill => skill.name) || []
      }));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<ProjectResponse>(`/api/projects/${id}`);
      
      return {
        ...response.data,
        skills: Array.from(response.data.skillNames || response.data.skills?.map(skill => skill.name) || [])
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du projet:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  create: async (project: Omit<Project, 'id'>) => {
    try {
      if (!authService.canWrite()) {
        throw new Error('Accès non autorisé');
      }
      const projectData = {
        ...project,
        status: project.status,
        skillNames: project.skills,
        skills: undefined,
        skillIds: undefined
      };
      console.log('Sending project data:', projectData);
      const response = await api.post<ProjectResponse>('/api/projects', projectData);
      console.log('Received response:', response.data);
      
      return {
        ...response.data,
        skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
      };
    } catch (error: any) {
      console.error('Erreur lors de la création du projet:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  update: async (id: number, project: Partial<Project>) => {
    try {
      if (!authService.canWrite()) {
        throw new Error('Accès non autorisé');
      }
      const projectData = {
        ...project,
        status: project.status,
        skillNames: project.skills,
        skills: undefined,
        skillIds: undefined
      };
      console.log('Sending project data:', projectData);
      const response = await api.put<ProjectResponse>(`/api/projects/${id}`, projectData);
      console.log('Received response:', response.data);
      
      return {
        ...response.data,
        skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
      };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      if (!authService.canWrite()) {
        throw new Error('Accès non autorisé');
      }
      await api.delete(`/api/projects/${id}`);
    } catch (error: any) {
      console.error('Erreur lors de la suppression du projet:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  getByStatus: async (status: string) => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<Project[]>(`/api/projects/status/${status}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets par statut:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  getByClient: async (client: string) => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<Project[]>(`/api/projects/client/${client}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets par client:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  searchBySkills: async (skills: string[]) => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<Project[]>('/api/projects/search', {
        params: { skills: skills.join(',') }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la recherche des projets:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  async getAllSkills(): Promise<Skill[]> {
    try {
      const response = await api.get<Skill[]>('/api/skills');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des compétences:', error);
      throw error;
    }
  },

  deactivate: async (id: number) => {
    try {
      if (!authService.canWrite()) {
        throw new Error('Accès non autorisé');
      }
      const response = await api.put<ProjectResponse>(`/api/projects/${id}/deactivate`);
      console.log('Deactivation response:', response.data);
      return {
        ...response.data,
        active: false,
        skills: response.data.skillNames ? Array.from(response.data.skillNames) : response.data.skills?.map(skill => skill.name) || []
      };
    } catch (error: any) {
      console.error('Erreur lors de la désactivation du projet:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  reactivate: async (id: number) => {
    try {
      if (!authService.canWrite()) {
        throw new Error('Accès non autorisé');
      }
      const response = await api.put<ProjectResponse>(`/api/projects/${id}/reactivate`);
      console.log('Reactivation response:', response.data);
      return {
        ...response.data,
        active: true,
        skills: response.data.skillNames ? Array.from(response.data.skillNames) : response.data.skills?.map(skill => skill.name) || []
      };
    } catch (error: any) {
      console.error('Erreur lors de la réactivation du projet:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  getActiveProjects: async () => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<ProjectResponse[]>('/api/projects/active');
      return response.data.map(project => ({
        ...project,
        skills: project.skillNames ? Array.from(project.skillNames) : project.skills?.map(skill => skill.name) || []
      }));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets actifs:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  getInactiveProjects: async () => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<ProjectResponse[]>('/api/projects/inactive');
      return response.data.map(project => ({
        ...project,
        skills: project.skillNames ? Array.from(project.skillNames) : project.skills?.map(skill => skill.name) || []
      }));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets inactifs:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },

  getProjectStatistics: async () => {
    try {
      if (!authService.canRead()) {
        throw new Error('Non authentifié');
      }
      const response = await api.get<{
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        criticalProjects: number;
      }>('/api/projects/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques des projets:', error);
      if (error?.response?.status === 403) {
        throw new Error('Accès non autorisé');
      }
      throw error;
    }
  },
};

export default projectService; 