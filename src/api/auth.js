import { api } from './client.js';

export const loginRequest = (email, password) =>
  api.post('/api/v1/auth/login', { email, password }, { skipIdempotency: true });

export const refreshRequest = () =>
  api.post('/api/v1/auth/refresh', {}, { skipIdempotency: true });

export const logoutRequest = () => api.post('/api/v1/auth/logout', {}, { skipIdempotency: true });

export const setLanguageRequest = (language_preference) =>
  api.patch('/api/v1/users/me/language', { language_preference });
