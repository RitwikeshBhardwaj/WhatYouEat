import { Router } from 'express';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  signupSchema, loginSchema, forgotEmailSchema, forgotPhoneSchema,
  verifyOtpSchema, resetPasswordSchema, resetPasswordOtpSchema, resetPasswordPinSchema,
} from '../validators/auth.validator.js';
import {
  signup, login, me, forgotPasswordEmail, forgotPasswordPhone,
  verifyOtp, resetPasswordToken, resetPasswordOtp, resetPasswordPin,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, me);
router.post('/forgot-password/email', validateRequest(forgotEmailSchema), forgotPasswordEmail);
router.post('/forgot-password/phone', validateRequest(forgotPhoneSchema), forgotPasswordPhone);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPasswordToken);
router.post('/reset-password/otp', validateRequest(resetPasswordOtpSchema), resetPasswordOtp);
router.post('/reset-password/pin', validateRequest(resetPasswordPinSchema), resetPasswordPin);

export default router;
