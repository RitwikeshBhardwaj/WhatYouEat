import api from './axios.js';

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (payload) => api.patch('/users/profile', payload);
export const setDailyGoal = (payload) => api.post('/users/goals', payload);
export const getDailyGoal = (date) => api.get('/users/goals', { params: { date } });
