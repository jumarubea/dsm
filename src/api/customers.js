import { api } from './client.js';

export const listCustomers = (search) =>
  api.get('/api/v1/customers', { params: search ? { search } : {} });
export const createCustomer = (body) => api.post('/api/v1/customers', body);
export const updateCustomer = (id, body) => api.patch(`/api/v1/customers/${id}`, body);
export const getCustomerHistory = (id) => api.get(`/api/v1/customers/${id}/history`);
