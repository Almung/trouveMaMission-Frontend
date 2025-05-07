import axios from 'axios';
import { authService } from '../services/authService';

interface RefreshTokenResponse {
    data: {
        token: string;
    };
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const instance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false // Changed to false since we're using token-based auth
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Ne pas tenter de rafraîchir le token si nous sommes sur la page de login
        const isLoginPage = window.location.pathname === '/login';
        
        // Si l'erreur est 401 et qu'on n'a pas encore essayé de rafraîchir le token
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._isRefreshToken && !isLoginPage) {
            originalRequest._retry = true;

            try {
                // Marquer la requête de rafraîchissement
                const refreshRequest = { ...originalRequest };
                refreshRequest._isRefreshToken = true;
                
                // Essayer de rafraîchir le token
                const response = await instance.post<RefreshTokenResponse>('/auth/refresh-token', {}, refreshRequest);
                const { token } = response.data.data;
                
                // Mettre à jour le token dans le stockage
                localStorage.setItem('token', token);
                
                // Mettre à jour l'en-tête Authorization
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                
                // Réessayer la requête originale
                return instance(originalRequest);
            } catch (refreshError) {
                // Si le rafraîchissement échoue, déconnecter l'utilisateur
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Si l'erreur est 403, déconnecter l'utilisateur
        if (error.response?.status === 403 && !isLoginPage) {
            authService.logout();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default instance; 