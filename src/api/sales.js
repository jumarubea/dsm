import { api } from './client.js';

export const createSale = (body) => api.post('/api/v1/sales', body);
export const getReceipt = (id) => api.get(`/api/v1/sales/${id}/receipt`);
