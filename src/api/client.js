import axios from 'axios';
import { generateIdempotencyKey } from '../utils/idempotencyKey.js';

// Access token lives in memory only (never localStorage).
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // send/receive the HttpOnly refresh cookie
});

const WRITE_METHODS = ['post', 'put', 'patch', 'delete'];

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  const method = (config.method || 'get').toLowerCase();
  if (WRITE_METHODS.includes(method) && !config.skipIdempotency && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = generateIdempotencyKey();
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (!response || !config) return Promise.reject(error);

    // One refresh attempt on 401, then retry the original request.
    if (response.status === 401 && !config._retried && !config.url?.includes('/auth/')) {
      config._retried = true;
      try {
        refreshing =
          refreshing || api.post('/api/v1/auth/refresh', {}, { skipIdempotency: true });
        const res = await refreshing;
        refreshing = null;
        const token = res.data?.data?.accessToken;
        if (token) {
          setAccessToken(token);
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        }
      } catch {
        refreshing = null;
      }
    }

    // Subscription inactive — let the app redirect to the upgrade screen.
    if (response.status === 402) {
      window.dispatchEvent(new CustomEvent('dsm:subscription-expired'));
    }

    return Promise.reject(error);
  }
);
