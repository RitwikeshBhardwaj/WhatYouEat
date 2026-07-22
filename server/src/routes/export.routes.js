import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { exportRangeSchema } from '../validators/export.validator.js';
import { exportWeeklyPdf } from '../controllers/export.controller.js';

const router = Router();

router.use(protect);
router.get('/weekly', validateRequest(exportRangeSchema), exportWeeklyPdf);

export default router;
