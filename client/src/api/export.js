import api from './axios.js';

export const exportWeekly = (params) =>
  api.get('/export/weekly', { params, responseType: 'blob' });
