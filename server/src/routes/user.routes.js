import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { updateProfileSchema, setGoalSchema } from '../validators/user.validator.js';
import {
  getProfile, updateProfile, setDailyGoal, getDailyGoal,
} from '../controllers/user.controller.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.post('/goals', validateRequest(setGoalSchema), setDailyGoal);
router.get('/goals', getDailyGoal);

export default router;
