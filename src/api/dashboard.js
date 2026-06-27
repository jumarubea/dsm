import { api } from './client.js';

export const getDashboardSummary = () => api.get('/api/v1/dashboard/summary');
