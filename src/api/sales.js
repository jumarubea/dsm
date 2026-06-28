import { api } from './client.js';

export const createSale = (body) => api.post('/api/v1/sales', body);
export const getReceipt = (id) => api.get(`/api/v1/sales/${id}/receipt`);
export const listSales = (params) => api.get('/api/v1/sales', { params });
export const getSale = (id) => api.get(`/api/v1/sales/${id}`);
export const confirmPayment = (id, body) => api.post(`/api/v1/sales/${id}/confirm-payment`, body);
export const voidSale = (id, body) => api.post(`/api/v1/sales/${id}/void`, body);
