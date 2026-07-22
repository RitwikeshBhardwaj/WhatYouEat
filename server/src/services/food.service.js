import { AppError } from '../middleware/error.js';

const BASE = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const cache = new Map();
const TTL = 5 * 60 * 1000;

const round = (n) => Math.round(n * 10) / 10;

const findNutrient = (nutrients, names) => {
  const item = (nutrients || []).find((nutrient) => names.includes(nutrient.nutrientName));
  return item && typeof item.value === 'number' ? round(item.value) : 0;
};

const parseFood = (food, query) => {
  const nutrients = food.foodNutrients || [];

  return {
    foodId: String(food.fdcId || ''),
    label: food.description || query,
    category: food.foodCategory || food.dataType || '',
    image: '',
    healthLabels: [],
    nutrition: {
      calories: findNutrient(nutrients, ['Energy', 'Energy (kcal)']),
      protein: findNutrient(nutrients, ['Protein']),
      carbs: findNutrient(nutrients, ['Carbohydrate, by difference', 'Carbohydrate']),
      fat: findNutrient(nutrients, ['Total lipid (fat)', 'Lipids']),
    },
    measures: [],
  };
};

export const searchFood = async (query) => {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    throw new AppError('USDA API key not configured', 500, 'USDA_NOT_CONFIGURED');
  }

  const key = query.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.t < TTL) return cached.v;

  const url = `${BASE}?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&pageSize=20`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new AppError(`USDA request failed (${res.status})`, 502, 'USDA_ERROR');
  }
  const json = await res.json();

  const items = (json.foods || []).slice(0, 20).map((food) => parseFood(food, query));
  const result = { query, count: items.length, items };
  cache.set(key, { v: result, t: Date.now() });
  return result;
};
