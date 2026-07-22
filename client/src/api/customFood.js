import api from './axios.js';

export const createCustomFood = (payload) => api.post('/custom-foods', payload);
export const getCustomFoods = () => api.get('/custom-foods');
export const getCustomFood = (id) => api.get(`/custom-foods/${id}`);
export const updateCustomFood = (id, payload) => api.patch(`/custom-foods/${id}`, payload);
export const deleteCustomFood = (id) => api.delete(`/custom-foods/${id}`);
