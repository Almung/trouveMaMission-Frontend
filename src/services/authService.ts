import axios from '../config/axios';
import { API_BASE_URL } from '../config';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface LoginResponse extends ApiResponse<AuthResponse> {}

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const authService = {
    async login(email: string, password: string) {
        try {
            const response = await axios.post<LoginResponse>('/auth/login', { email, password });
            
            if (!response.data?.data?.token) {
                throw new Error('Erreur d\'authentification: token manquant');
            }

            const { token, user } = response.data.data;
            
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            
            if (tokenPayload.roles) {
                user.role = tokenPayload.roles.replace('ROLE_', '');
            }
            
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            
            return response.data.data;
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 401) {
                    throw new Error('Email ou mot de passe incorrect');
                } else if (error.response.status === 403) {
                    throw new Error('Accès non autorisé');
                } else if (error.response.data?.message) {
                    throw new Error(error.response.data.message);
                }
            } else if (error.request) {
                throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
            } else {
                throw new Error('Une erreur est survenue lors de la connexion');
            }
        }
    },

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getCurrentUser() {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            return null;
        }
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    getTokenPayload() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    hasRole(role: string) {
        const user = this.getCurrentUser();
        if (!user || !user.role) return false;
        return user.role.toUpperCase() === role.toUpperCase();
    },

    isSimpleUser() {
        const user = this.getCurrentUser();
        
        if (!user || !user.role) {
            return false;
        }
        
        const normalizedRole = user.role.trim().toUpperCase();
        return normalizedRole === 'USER';
    },

    canRead() {
        return this.isAuthenticated();
    },

    canWrite() {
        return this.hasRole('ADMIN') || this.hasRole('MANAGER');
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/register`, data);
        return response.data.data;
    }
}; 