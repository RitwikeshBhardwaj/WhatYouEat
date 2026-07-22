import api from './axios.js';

export const searchFood = (q) => api.get('/foods/search', { params: { q } });
