import api from '../config/axios';
import { authService } from './authService';

export interface DashboardData {
  totalActiveProjects: number;
  totalCollaborators: number;
  activeAssignments: number;
  overallProjectProgress: number;
  recentProjectUpdates: number;
  overdueProjects: number;
  newAssignments: number;
}

const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      if (!authService.isAuthenticated()) {
        authService.logout();
        throw new Error('Non authentifié');
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        authService.logout();
        throw new Error('Non authentifié');
      }
      
      const response = await api.get<DashboardData>('/api/dashboard');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        authService.logout();
        window.location.href = '/login';
      }
      throw error;
    }
  }
};

export default dashboardService; 