import axios from 'axios';

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
        // Example: Retrieve a token from localStorage (if your app uses it)
        const token = localStorage.getItem('auth_token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 👉 Thêm dòng này
        if (config.headers) {
        config.headers['X-User-Id'] = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
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
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger

        // Example: Handle 401 Unauthorized globally
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request. Possible expired token.');
            // Optional: Redirect to login or clear token
            // localStorage.removeItem('auth_token');
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);