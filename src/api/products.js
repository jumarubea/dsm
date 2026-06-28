import { api } from './client.js';

export const listProducts = () => api.get('/api/v1/products');
export const createProduct = (body) => api.post('/api/v1/products', body);
export const updateProduct = (id, body) => api.patch(`/api/v1/products/${id}`, body);
export const deleteProduct = (id) => api.delete(`/api/v1/products/${id}`);
