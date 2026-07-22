import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { searchFoodSchema } from '../validators/food.validator.js';
import { searchFood } from '../controllers/food.controller.js';

const router = Router();

router.use(protect);
router.get('/search', validateRequest(searchFoodSchema), searchFood);

export default router;
