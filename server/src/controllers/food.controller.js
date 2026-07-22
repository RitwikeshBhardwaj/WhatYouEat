import { success } from '../utils/response.js';
import { AppError } from '../middleware/error.js';
import { searchFood as searchFoodService } from '../services/food.service.js';

const HEALTH_BADGES = [
  'High Protein', 'Low Sugar', 'Low Fat', 'Low Carb', 'High Fiber',
  'Low Sodium', 'Low Calories', 'High Calcium', 'High Iron',
];

const pickBadges = (labels = []) => {
  if (!Array.isArray(labels)) return [];
  const set = new Set(labels.map((l) => (typeof l === 'string' ? l : '')));
  return HEALTH_BADGES.filter((b) => set.has(b));
};

export const searchFood = async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || !q.trim()) throw new AppError('Query "q" is required', 400, 'VALIDATION_ERROR');
    const data = await searchFoodService(q);
    const items = data.items.map((it) => ({ ...it, badges: pickBadges(it.healthLabels) }));
    success(res, { query: data.query, count: items.length, items });
  } catch (err) {
    next(err);
  }
};
