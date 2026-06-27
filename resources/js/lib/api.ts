// ---------------------------------------------------------------------------
// Axios API Client
// ---------------------------------------------------------------------------

import axios from 'axios';

const TOKEN_KEY = 'chulx_auth_token';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request: attach Bearer token when present
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response: handle 401 globally (session expired / invalid token)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);

      // Only redirect if we're not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export { TOKEN_KEY };
export default api;
