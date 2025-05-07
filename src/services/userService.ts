import api from '../config/axios';

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  role: UserRole;
}

export interface CreateUserRequest extends Omit<User, 'id'> {
  password: string;
}

const userService = {
  getAll: async () => {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },

  create: async (user: CreateUserRequest) => {
    const response = await api.post<User>('/api/users', user);
    return response.data;
  },

  update: async (id: number, user: Omit<User, 'id'>) => {
    const response = await api.put<User>(`/api/users/${id}`, user);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/users/${id}`);
  },

  changePassword: async (id: number, oldPassword: string, newPassword: string) => {
    await api.post(`/api/users/${id}/change-password`, {
      oldPassword,
      newPassword
    });
  }
};

export default userService; 