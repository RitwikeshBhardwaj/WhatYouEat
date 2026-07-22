import api from './axios.js';

export const createMeal = (payload) => api.post('/meals', payload);
export const getMeals = (params) => api.get('/meals', { params });
export const getMeal = (id) => api.get(`/meals/${id}`);
export const updateMeal = (id, payload) => api.patch(`/meals/${id}`, payload);
export const deleteMeal = (id) => api.delete(`/meals/${id}`);
export const getDailySummary = (params) => api.get('/meals/summary', { params });
