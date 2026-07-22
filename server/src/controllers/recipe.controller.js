import { AppError } from '../middleware/error.js';
import { success } from '../utils/response.js';
import { analyzeRecipe as analyzeRecipeService } from '../services/recipe.service.js';

export const analyzeRecipe = async (req, res, next) => {
  try {
    const { input, type, servings } = req.body;
    const data = await analyzeRecipeService(input, type, servings);
    success(res, { recipe: data });
  } catch (err) {
    next(err);
  }
};
