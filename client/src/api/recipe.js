import api from './axios.js';

export const analyzeRecipe = (input, type = 'text', servings = 8) =>
  api.post('/recipes/analyze', { input, type, servings });
