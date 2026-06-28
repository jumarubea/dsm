import { api } from './client.js';

export const stockIn = (body) => api.post('/api/v1/inventory/stock-in', body);
export const adjustment = (body) => api.post('/api/v1/inventory/adjustment', body);
export const listMovements = (params) => api.get('/api/v1/inventory/movements', { params });
export const listLowStock = () => api.get('/api/v1/inventory/low-stock');
