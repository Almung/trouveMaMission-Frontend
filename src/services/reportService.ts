import api from '../config/axios';

export interface Report {
  id?: number;
  projectId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
}

export interface ReportStatistics {
  projectStatusStats: {
    total: number;
    active: number;
    inactive: number;
  };
  
  assignmentStats: {
    activeAssignments: number;
    endingSoon: number;
    collaboratorsToBeReleased: number;
  };
  
  dashboardStats: {
    totalActiveProjects: number;
    totalCollaborators: number;
    recentProjectUpdates: number;
    overdueProjects: number;
    newAssignments: number;
    overallProjectProgress: number;
  };

  collaboratorStats: {
    onMission: number;
    free: number;
    onLeave: number;
    total: number;
    skills: Record<string, number>;
    topSkills: Array<{
      name: string;
      count: number;
    }>;
  };
}

interface DashboardData {
  totalActiveProjects: number;
  totalCollaborators: number;
  recentProjectUpdates: number;
  overdueProjects: number;
  newAssignments: number;
  overallProjectProgress: number;
}

export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  criticalProjects: number;
  leastUsedSkills: Array<{
    name: string;
    category: string;
  }>;
}

interface CollaboratorStatistics {
  onMission: number;
  free: number;
  onLeave: number;
  total: number;
  skills: Record<string, number>;
  topSkills: Array<{
    name: string;
    count: number;
  }>;
}

const reportService = {
  getAll: async (): Promise<Report[]> => {
    const response = await api.get<Report[]>('/reports');
    return response.data;
  },

  getById: async (id: number): Promise<Report> => {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  getByProject: async (projectId: number): Promise<Report[]> => {
    const response = await api.get<Report[]>(`/reports/project/${projectId}`);
    return response.data;
  },

  create: async (report: Report): Promise<Report> => {
    const response = await api.post<Report>('/reports', report);
    return response.data;
  },

  update: async (id: number, report: Report): Promise<Report> => {
    const response = await api.put<Report>(`/reports/${id}`, report);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  getReportStatistics: async (): Promise<ReportStatistics> => {
    const [projectStats, assignmentStats, dashboardStats, collaboratorStats] = await Promise.all([
      api.get<ReportStatistics['projectStatusStats']>('/api/projects/statistics'),
      api.get<ReportStatistics['assignmentStats']>('/api/assignments/removal-stats'),
      api.get<ReportStatistics['dashboardStats']>('/api/dashboard'),
      api.get<ReportStatistics['collaboratorStats']>('/api/collaborators/statistics')
    ]);

    return {
      projectStatusStats: projectStats.data,
      assignmentStats: assignmentStats.data,
      dashboardStats: dashboardStats.data,
      collaboratorStats: collaboratorStats.data
    };
  },

  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/api/dashboard');
    return response.data;
  },

  async getProjectStatistics(): Promise<ProjectStatistics> {
    const response = await api.get<ProjectStatistics>('/api/projects/statistics');
    return response.data;
  },

  async getCollaboratorStatistics(): Promise<CollaboratorStatistics> {
    const response = await api.get<CollaboratorStatistics>('/api/collaborators/statistics');
    return response.data;
  }
};

export default reportService; 