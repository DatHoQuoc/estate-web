// @ts-nocheck
import axios from 'axios';

import { handleTokenRefresh } from './refresh-token-manager';

// ----------------------------------------------------------------------------
// API Endpoints Configuration
// ----------------------------------------------------------------------------
export const ENDPOINTS = {
    CREDITS: {
        BALANCE: '/credits/balance',
        TRANSACTIONS: '/credits/transactions',
        REFUNDS: '/credits/refunds',
        REFUNDS_PENDING: '/credits/refunds/pending',
        POSTS_IS_FIRST: '/credits/posts/is-first',

        TOPUP_INITIATE: '/credits/topup/initiate',
        USAGE_CHAT: '/credits/usage/chat',
        USAGE_POST_LOCK: '/credits/usage/post/lock',
        USAGE_POST_RESOLVE: '/credits/usage/post/resolve',
    }
} as const;

// ----------------------------------------------------------------------------
// Axios Client Configuration
// ----------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_TRANSACTION_API_BASE_URL || 'http://localhost:8080/api/v1';
const authBaseURL = import.meta.env.VITE_API_BASE_AUTH || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000, // 10 second timeout for all requests
});

// ----------------------------------------------------------------------------
// Interceptors
// ----------------------------------------------------------------------------

// Add a request interceptor to automatically attach Auth Tokens if available
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle 401 Unauthorized globally by attempting to refresh the token
        if (error.response && error.response.status === 401) {
            return handleTokenRefresh(error, apiClient, authBaseURL);
        }

        return Promise.reject(error);
    }
);