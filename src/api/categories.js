import { api } from './client.js';

export const listCategories = () => api.get('/api/v1/categories');
export const createCategory = (body) => api.post('/api/v1/categories', body);
