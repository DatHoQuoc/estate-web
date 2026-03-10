import axios from 'axios';
import { 
    AUTH_ENDPOINTS, 
    LoginDto, 
    RegisterDto, 
    RefreshTokenDto, 
    VerifyEmailDto, 
    AuthResponse, 
    UpdateUserDto, 
    UserResponseDto, 
    AdminCreateUserDto, 
    AdminUpdateUserDto, 
    RoleResponseDto 
} from './auth-types';

import { handleTokenRefresh } from './refresh-token-manager';

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

authApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            return handleTokenRefresh(error, authApiClient, baseURL);
        }
        return Promise.reject(error);
    }
);

export const authClient = {
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.LOGIN, data);
        return res.data;
    },

    register: async (data: RegisterDto): Promise<any> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.REGISTER, data);
        return res.data;
    },

    getProfile: async (): Promise<UserResponseDto> => {
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
    },

    // User Profile Actions
    updateProfile: async (data: UpdateUserDto): Promise<UserResponseDto> => {
        const res = await authApiClient.patch(AUTH_ENDPOINTS.UPDATE_PROFILE, data);
        return res.data;
    },

    // Admin User Management
    listUsers: async (): Promise<UserResponseDto[]> => {
        const res = await authApiClient.get(AUTH_ENDPOINTS.USERS);
        return res.data;
    },

    adminCreateUser: async (data: AdminCreateUserDto): Promise<UserResponseDto> => {
        const res = await authApiClient.post(AUTH_ENDPOINTS.USERS, data);
        return res.data;
    },

    findOneUser: async (id: string): Promise<UserResponseDto> => {
        const res = await authApiClient.get(`${AUTH_ENDPOINTS.USERS}/${id}`);
        return res.data;
    },

    adminUpdateUser: async (id: string, data: AdminUpdateUserDto): Promise<UserResponseDto> => {
        const res = await authApiClient.patch(`${AUTH_ENDPOINTS.USERS}/${id}`, data);
        return res.data;
    },

    removeUser: async (id: string): Promise<void> => {
        await authApiClient.delete(`${AUTH_ENDPOINTS.USERS}/${id}`);
    },

    // Roles
    findAllRoles: async (): Promise<RoleResponseDto[]> => {
        const res = await authApiClient.get(AUTH_ENDPOINTS.ROLES);
        return res.data;
    }
};
