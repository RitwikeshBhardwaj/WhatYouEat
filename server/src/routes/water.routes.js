import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { waterSchema, waterAddSchema, dateSchema } from '../validators/water.validator.js';
import {
  setWater, addWater, getWater, getWaterWeek,
} from '../controllers/water.controller.js';

const router = Router();

router.use(protect);
router.get('/week', validateRequest(dateSchema), getWaterWeek);
router.get('/', validateRequest(dateSchema), getWater);
router.post('/', validateRequest(waterSchema), setWater);
router.post('/add', validateRequest(waterAddSchema), addWater);

export default router;
