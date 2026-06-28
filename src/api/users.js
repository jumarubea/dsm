import { api } from './client.js';

export const listUsers = () => api.get('/api/v1/users');
export const createUser = (body) => api.post('/api/v1/users', body);
export const updateUser = (id, body) => api.patch(`/api/v1/users/${id}`, body);
export const deactivateUser = (id) => api.delete(`/api/v1/users/${id}`);
