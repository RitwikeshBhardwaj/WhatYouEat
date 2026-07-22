import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createCustomFoodSchema, updateCustomFoodSchema, idSchema,
} from '../validators/customFood.validator.js';
import {
  createCustomFood, getCustomFoods, getCustomFood, updateCustomFood, deleteCustomFood,
} from '../controllers/customFood.controller.js';

const router = Router();

router.use(protect);
router.post('/', validateRequest(createCustomFoodSchema), createCustomFood);
router.get('/', getCustomFoods);
router.get('/:id', validateRequest(idSchema), getCustomFood);
router.patch('/:id', validateRequest(updateCustomFoodSchema), updateCustomFood);
router.delete('/:id', validateRequest(idSchema), deleteCustomFood);

export default router;
