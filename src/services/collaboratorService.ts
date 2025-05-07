import axios from '../config/axios';

export enum CollaboratorStatus {
  DISPONIBLE = 'DISPONIBLE',
  EN_MISSION = 'EN_MISSION',
  EN_CONGE = 'EN_CONGE'
}

export const CollaboratorStatusLabels: Record<CollaboratorStatus, string> = {
  [CollaboratorStatus.DISPONIBLE]: 'Disponible',
  [CollaboratorStatus.EN_MISSION]: 'En mission',
  [CollaboratorStatus.EN_CONGE]: 'En congé'
};

export const CollaboratorStatusValues: Record<string, CollaboratorStatus> = {
  'DISPONIBLE': CollaboratorStatus.DISPONIBLE,
  'EN_MISSION': CollaboratorStatus.EN_MISSION,
  'EN_CONGE': CollaboratorStatus.EN_CONGE
};

export interface Skill {
  id: number;
  name: string;
  category: string;
}

interface CollaboratorResponse {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  grade: string;
  status: CollaboratorStatus;
  experienceYears: number;
  skills: Skill[];
  skillNames?: string[];
  skillIds?: number[];
  active: boolean;
}

export interface Collaborator {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  grade: string;
  status: CollaboratorStatus;
  experienceYears: number;
  skills: string[];
  skillNames?: string[];
  skillIds?: number[];
  active: boolean;
}

class CollaboratorService {
  async getAll(): Promise<Collaborator[]> {
    const response = await axios.get<CollaboratorResponse[]>('/api/collaborators/all');
    console.log('Raw collaborator response:', response.data);
    const transformedData = response.data.map(collaborator => ({
      ...collaborator,
      skills: collaborator.skillNames || collaborator.skills?.map(skill => skill.name) || []
    }));
    console.log('Transformed collaborator data:', transformedData);
    return transformedData;
  }

  async getById(id: number): Promise<Collaborator> {
    const response = await axios.get<CollaboratorResponse>(`/api/collaborators/${id}`);
    console.log('Raw collaborator response:', response.data);
    const transformedData = {
      ...response.data,
      skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
    };
    console.log('Transformed collaborator data:', transformedData);
    return transformedData;
  }

  async create(collaborator: Omit<Collaborator, 'id'>): Promise<Collaborator> {
    const collaboratorData = {
      ...collaborator,
      status: collaborator.status,
      skillNames: collaborator.skills,
      skills: undefined,
      skillIds: undefined
    };
    console.log('Sending collaborator data:', collaboratorData);
    const response = await axios.post<CollaboratorResponse>('/api/collaborators', collaboratorData);
    console.log('Received response:', response.data);
    const transformedData = {
      ...response.data,
      skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
    };
    console.log('Transformed collaborator data:', transformedData);
    return transformedData;
  }

  async update(id: number, collaborator: Partial<Collaborator>): Promise<Collaborator> {
    const collaboratorData = {
      ...collaborator,
      status: collaborator.status,
      skillNames: collaborator.skills,
      skills: undefined,
      skillIds: undefined
    };
    console.log('Sending collaborator data:', collaboratorData);
    const response = await axios.put<CollaboratorResponse>(`/api/collaborators/${id}`, collaboratorData);
    console.log('Received response:', response.data);
    const transformedData = {
      ...response.data,
      skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
    };
    console.log('Transformed collaborator data:', transformedData);
    return transformedData;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/collaborators/${id}`);
  }

  async searchBySkills(skills: string[]): Promise<Collaborator[]> {
    const response = await axios.get<CollaboratorResponse[]>('/api/collaborators/search', {
      params: { skills: skills.join(',') }
    });
    console.log('Raw collaborator response:', response.data);
    const transformedData = response.data.map(collaborator => ({
      ...collaborator,
      skills: collaborator.skillNames || collaborator.skills?.map(skill => skill.name) || []
    }));
    console.log('Transformed collaborator data:', transformedData);
    return transformedData;
  }

  async getAllSkills(): Promise<string[]> {
    const response = await axios.get<Skill[]>('/api/skills');
    return response.data.map(skill => skill.name);
  }

  async deactivate(id: number): Promise<Collaborator> {
    const response = await axios.put<CollaboratorResponse>(`/api/collaborators/${id}/deactivate`);
    console.log('Raw deactivate response:', response.data);
    const transformedData = {
      ...response.data,
      skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
    };
    console.log('Transformed deactivate data:', transformedData);
    return transformedData;
  }

  async reactivate(id: number): Promise<Collaborator> {
    const response = await axios.put<CollaboratorResponse>(`/api/collaborators/${id}/reactivate`);
    console.log('Raw reactivate response:', response.data);
    const transformedData = {
      ...response.data,
      skills: response.data.skillNames || response.data.skills?.map(skill => skill.name) || []
    };
    console.log('Transformed reactivate data:', transformedData);
    return transformedData;
  }

  async getActiveCollaborators(): Promise<Collaborator[]> {
    const response = await axios.get<CollaboratorResponse[]>('/api/collaborators/active');
    console.log('Raw active collaborators response:', response.data);
    const transformedData = response.data.map(collaborator => ({
      ...collaborator,
      skills: collaborator.skillNames || collaborator.skills?.map(skill => skill.name) || []
    }));
    console.log('Transformed active collaborators data:', transformedData);
    return transformedData;
  }

  async getInactiveCollaborators(): Promise<Collaborator[]> {
    const response = await axios.get<CollaboratorResponse[]>('/api/collaborators/inactive');
    console.log('Raw inactive collaborators response:', response.data);
    const transformedData = response.data.map(collaborator => ({
      ...collaborator,
      skills: collaborator.skillNames || collaborator.skills?.map(skill => skill.name) || []
    }));
    console.log('Transformed inactive collaborators data:', transformedData);
    return transformedData;
  }

  async getCollaboratorStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const response = await axios.get<{
      total: number;
      active: number;
      inactive: number;
    }>('/api/collaborators/stats');
    return response.data;
  }
}

export const collaboratorService = new CollaboratorService(); 