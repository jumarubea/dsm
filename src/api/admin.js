import { api } from './client.js';

export const listTenants = () => api.get('/admin/v1/tenants');
export const createTenant = (body) => api.post('/admin/v1/tenants', body);
export const suspendTenant = (id) => api.post(`/admin/v1/tenants/${id}/suspend`);
export const activateTenant = (id) => api.post(`/admin/v1/tenants/${id}/activate`);
export const impersonateTenant = (id) => api.post(`/admin/v1/tenants/${id}/impersonate`);

export const listPlans = () => api.get('/admin/v1/plans');
export const createPlan = (body) => api.post('/admin/v1/plans', body);
export const updatePlan = (id, body) => api.patch(`/admin/v1/plans/${id}`, body);
export const deactivatePlan = (id) => api.delete(`/admin/v1/plans/${id}`);

export const platformDashboard = () => api.get('/admin/v1/dashboard');
export const tenantsHealth = () => api.get('/admin/v1/dashboard/tenants-health');
