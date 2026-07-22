import api from './axios.js';

export const setWater = (glasses, date) => api.post('/water', { glasses, date });
export const addWater = (delta, date) => api.post('/water/add', { delta, date });
export const getWater = (date) => api.get('/water', { params: { date } });
export const getWaterWeek = (date) => api.get('/water/week', { params: { date } });
