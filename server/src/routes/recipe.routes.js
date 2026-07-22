import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { analyzeRecipeSchema } from '../validators/recipe.validator.js';
import { analyzeRecipe } from '../controllers/recipe.controller.js';

const router = Router();

router.use(protect);
router.post('/analyze', validateRequest(analyzeRecipeSchema), analyzeRecipe);

export default router;
