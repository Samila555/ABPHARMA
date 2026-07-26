import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
});

/**
 * Converts a stored image path like "/uploads/medicines/xxx.jpg" into a
 * full URL that works in both development (Vite proxy) and production.
 * - In production the backend serves /uploads as static files from the same origin.
 * - In dev Vite proxies /uploads → localhost:5000.
 * So a simple relative path always works; this helper just guards against nulls
 * and ensures paths that accidentally got a full URL stored are kept intact.
 */
export function getImageUrl(imagePath) {
    if (!imagePath) return null;
    // Already a full URL (http/https/data)
    if (/^(https?:|data:)/.test(imagePath)) return imagePath;
    // Ensure it starts with /
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('abpharma_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('abpharma_token');
            localStorage.removeItem('abpharma_user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;
