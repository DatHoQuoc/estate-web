import axios from 'axios';
import { AUTH_ENDPOINTS, LoginDto, RegisterDto, RefreshTokenDto, VerifyEmailDto, AuthResponse } from './auth-types';

const baseURL = import.meta.env.VITE_API_BASE_AUTH || 'http://localhost:8080/api/v1';

export const authApiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
});

authApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authClient = {
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.LOGIN, data);
        return res.data;
    },

    register: async (data: RegisterDto): Promise<void> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.REGISTER, data);
        return res.data;
    },

    getProfile: async (): Promise<any> => {
        const res = await authApiClient.get(AUTH_ENDPOINTS.PROFILE);
        return res.data;
    },

    refresh: async (data: RefreshTokenDto): Promise<AuthResponse> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.REFRESH, data);
        return res.data;
    },

    verifyEmail: async (data: VerifyEmailDto): Promise<void> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, data);
        return res.data;
    },

    logout: async (): Promise<void> => {
        await authApiClient.post(AUTH_ENDPOINTS.LOGOUT);
    }
};
