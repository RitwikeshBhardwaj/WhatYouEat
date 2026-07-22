import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createMealSchema, updateMealSchema, mealIdSchema, dateRangeSchema } from '../validators/meal.validator.js';
import {
  createMeal, getMeals, getMeal, updateMeal, deleteMeal, getDailySummary,
} from '../controllers/meal.controller.js';

const router = Router();

router.use(protect);

router.get('/summary', validateRequest(dateRangeSchema), getDailySummary);
router.post('/', validateRequest(createMealSchema), createMeal);
router.get('/', validateRequest(dateRangeSchema), getMeals);
router.get('/:id', validateRequest(mealIdSchema), getMeal);
router.patch('/:id', validateRequest(updateMealSchema), updateMeal);
router.delete('/:id', validateRequest(mealIdSchema), deleteMeal);

export default router;
