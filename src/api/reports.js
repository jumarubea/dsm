import { api } from './client.js';

export const reportDaily = (params) => api.get('/api/v1/reports/daily', { params });
export const reportMonthly = (params) => api.get('/api/v1/reports/monthly', { params });
export const reportProfit = (params) => api.get('/api/v1/reports/profit', { params });
export const reportFastMoving = () => api.get('/api/v1/reports/fast-moving');
export const reportDeadStock = () => api.get('/api/v1/reports/dead-stock');

/** Fetch a report as CSV (authenticated) and trigger a browser download. */
export const downloadReportCsv = async (path, params, filename) => {
  const res = await api.get(`/api/v1/reports/${path}`, {
    params: { ...params, format: 'csv' },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
