import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token from localStorage/sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skyline_auth_token') || sessionStorage.getItem('skyline_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract clean user-facing error message
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;

      // Handle 401 Unauthorized globally for authenticated routes (session expired)
      const isPublicAuthRoute =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/forgot-password') ||
        error.config?.url?.includes('/auth/reset-password');

      if (status === 401 && !isPublicAuthRoute) {
        localStorage.removeItem('skyline_auth_token');
        sessionStorage.removeItem('skyline_auth_token');
        localStorage.removeItem('skyline_auth_user');
        sessionStorage.removeItem('skyline_auth_user');
      }

      const customError: any = new Error(
        data?.error || data?.message || `Request failed with status ${status}`
      );
      customError.status = status;
      customError.errors = data?.errors;
      customError.code = data?.code;
      return Promise.reject(customError);
    } else if (error.request) {
      const networkError: any = new Error(
        'Unable to connect to SKYLINE CRM servers. Please check your network connection.'
      );
      networkError.status = 0;
      return Promise.reject(networkError);
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
