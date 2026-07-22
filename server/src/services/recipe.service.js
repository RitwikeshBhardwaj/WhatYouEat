import { AppError } from '../middleware/error.js';

const BASE = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const DEFAULT_YIELD = 8;

const round = (n) => Math.round(n * 10) / 10;

const isUrl = (str) => {
  try {
    const u = new URL(str);
    return !!u.protocol;
  } catch {
    return false;
  }
};

const findNutrient = (nutrients, names) => {
  const item = (nutrients || []).find((nutrient) => names.includes(nutrient.nutrientName));
  return item && typeof item.value === 'number' ? round(item.value) : 0;
};

const parseFood = (food, query) => {
  const nutrients = food.foodNutrients || [];

  return {
    label: food.description || query,
    nutrition: {
      calories: findNutrient(nutrients, ['Energy', 'Energy (kcal)']),
      protein: findNutrient(nutrients, ['Protein']),
      carbs: findNutrient(nutrients, ['Carbohydrate, by difference', 'Carbohydrate']),
      fat: findNutrient(nutrients, ['Total lipid (fat)', 'Lipids']),
      fiber: findNutrient(nutrients, ['Fiber, total dietary', 'Total dietary fiber']),
      sugar: findNutrient(nutrients, ['Sugars, total including NLEA', 'Sugars, total']),
    },
  };
};

export const parseIngredientLine = (text) => {
  const normalized = (text || '').trim();
  if (!normalized) {
    return { quantity: 1, unit: '', ingredient: '' };
  }

  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?|[0-9]+\/[0-9]+)?\s*(cups?|tbsp|tablespoons?|tsp|teaspoons?|g|gram|grams|oz|ounce|ounces|lb|lbs|pound|pounds|ml|milliliters?|milliliter|l|liter|liters?|egg|eggs|piece|pieces|item|items|slice|slices)?\s*(.+)$/i);

  if (!match) {
    return { quantity: 1, unit: '', ingredient: normalized };
  }

  const [, rawQuantity, rawUnit, rawIngredient] = match;
  let quantity = 1;

  if (rawQuantity) {
    const parsed = rawQuantity.includes('/')
      ? rawQuantity.split('/').reduce((acc, part) => acc / Number(part), Number(rawQuantity.split('/')[0]))
      : Number(rawQuantity);

    quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  const unit = normalizeUnit(rawUnit || '');
  const ingredient = (rawIngredient || normalized).trim().replace(/^of\s+/i, '');

  return { quantity, unit, ingredient };
};

const normalizeUnit = (unit = '') => {
  const normalized = unit.trim().toLowerCase();

  if (!normalized) return '';

  if (normalized.startsWith('cup')) return 'cup';
  if (normalized.startsWith('tablespoon')) return 'tbsp';
  if (normalized.startsWith('teaspoon')) return 'tsp';
  if (normalized.startsWith('gram')) return 'g';
  if (normalized.startsWith('ounce')) return 'oz';
  if (normalized.startsWith('pound')) return 'lb';
  if (normalized.startsWith('milliliter')) return 'ml';
  if (normalized.startsWith('liter')) return 'l';
  if (normalized.startsWith('egg')) return 'egg';
  if (normalized.startsWith('piece')) return 'piece';
  if (normalized.startsWith('item')) return 'item';
  if (normalized.startsWith('slice')) return 'slice';

  return normalized;
};

const getBaseAmountForUnit = (unit = '') => {
  switch (unit) {
    case 'cup':
      return 120;
    case 'tbsp':
      return 15;
    case 'tsp':
      return 5;
    case 'g':
      return 1;
    case 'oz':
      return 28.35;
    case 'lb':
      return 453.6;
    case 'ml':
      return 1;
    case 'l':
      return 1000;
    case 'egg':
      return 50;
    case 'piece':
      return 50;
    case 'item':
      return 50;
    case 'slice':
      return 25;
    default:
      return 100;
  }
};

export const scaleNutritionToAmount = (nutrition = {}, parsed = {}) => {
  const quantity = Number(parsed.quantity || 1);
  const unit = parsed.unit || '';
  const baseAmount = getBaseAmountForUnit(unit);
  const plainFactor = quantity > 0 ? (quantity * baseAmount) / 100 : 1;
  const conservativeFactor = Math.max(0.35, Math.min(0.8, plainFactor * 0.6));
  const scaled = Math.max(0, conservativeFactor);

  return {
    calories: round((nutrition.calories || 0) * scaled),
    protein: round((nutrition.protein || 0) * scaled),
    carbs: round((nutrition.carbs || 0) * scaled),
    fat: round((nutrition.fat || 0) * scaled),
    fiber: round((nutrition.fiber || 0) * scaled),
    sugar: round((nutrition.sugar || 0) * scaled),
  };
};

const searchFoodItem = async (query, apiKey) => {
  const url = `${BASE}?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&pageSize=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new AppError(`USDA request failed (${res.status})`, 502, 'USDA_ERROR');
  }

  const json = await res.json();
  const food = (json.foods || [])[0];
  if (!food) return null;

  return parseFood(food, query);
};

export const analyzeRecipe = async (input, type = 'text', servings = DEFAULT_YIELD) => {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    throw new AppError('USDA API key not configured', 500, 'USDA_NOT_CONFIGURED');
  }

  if (type === 'url' || isUrl(input)) {
    throw new AppError('Recipe URL analysis is not supported with USDA FoodData Central', 400, 'RECIPE_URL_UNSUPPORTED');
  }

  const lines = input
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

  const ingredients = await Promise.all(
    lines.map(async (text) => {
      const parsed = parseIngredientLine(text);
      const item = await searchFoodItem(parsed.ingredient || text, apiKey);
      const nutrition = scaleNutritionToAmount(item?.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      }, parsed);

      return {
        text,
        food: item?.label || parsed.ingredient || text,
        nutrition,
        found: Boolean(item),
      };
    })
  );

  const totalNutrition = ingredients.reduce(
    (sum, item) => ({
      calories: sum.calories + item.nutrition.calories,
      protein: sum.protein + item.nutrition.protein,
      carbs: sum.carbs + item.nutrition.carbs,
      fat: sum.fat + item.nutrition.fat,
      fiber: sum.fiber + item.nutrition.fiber,
      sugar: sum.sugar + item.nutrition.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  const safeServings = Math.max(1, Number(servings) || DEFAULT_YIELD);
  const note = ingredients.some((item) => !item.found)
    ? 'Some ingredients could not be found in USDA FoodData Central and are shown with zero nutrition.'
    : 'Nutrition values are estimated from parsed ingredient quantities and may vary by brand and preparation.';

  return {
    label: 'USDA Recipe Analysis',
    image: '',
    source: 'USDA FoodData Central',
    yield: safeServings,
    ingredients,
    totalNutrition: {
      calories: round(totalNutrition.calories),
      protein: round(totalNutrition.protein),
      carbs: round(totalNutrition.carbs),
      fat: round(totalNutrition.fat),
      fiber: round(totalNutrition.fiber),
      sugar: round(totalNutrition.sugar),
    },
    perServing: {
      calories: round(totalNutrition.calories / safeServings),
      protein: round(totalNutrition.protein / safeServings),
      carbs: round(totalNutrition.carbs / safeServings),
      fat: round(totalNutrition.fat / safeServings),
    },
    dietLabels: [],
    healthLabels: [],
    dailyPercent: {},
    note,
  };
};
