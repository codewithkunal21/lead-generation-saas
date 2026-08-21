import axios from 'axios';

// ---------------------------------------------------------------------------
// API Base URL Resolution
//
// Priority order:
//   1. VITE_API_BASE_URL environment variable (set in Vercel project settings)
//   2. http://localhost:8000 (local development fallback)
//
// NEVER hardcode a Vercel deployment URL here. The production backend runs as
// a Dockerized FastAPI service on Render/Railway/Fly.io, not on Vercel.
//
// In Vercel project settings, add:
//   VITE_API_BASE_URL = https://your-backend-service.onrender.com
//
// The apiClient base URL is: <VITE_API_BASE_URL>/api/v1
// Example production request: POST https://your-backend.onrender.com/api/v1/auth/login
// ---------------------------------------------------------------------------

function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (envUrl && envUrl.trim() !== '') {
    // Strip trailing slash to prevent double-slash in paths like //api/v1
    return envUrl.trim().replace(/\/$/, '');
  }

  // Local development fallback
  return 'http://localhost:8000';
}

const BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Include credentials (cookies) for future session support
  withCredentials: false,
});

// ---------------------------------------------------------------------------
// Request Interceptor: Attach JWT Auth Token
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response Interceptor: Global Error Handler
//
// 401 on a protected route → clear token and redirect to login.
// 401 on login/register → do NOT redirect (let the login page handle it).
// Network errors → pass through so callers can distinguish CORS/network issues.
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/login-access-token');

      if (!isAuthEndpoint) {
        // Token is expired or invalid on a protected route — clear and redirect
        localStorage.removeItem('token');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
