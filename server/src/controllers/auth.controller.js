import User from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { signToken } from '../middleware/auth.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { sendPasswordResetEmail, sendRecoveryPinEmail } from '../services/email.service.js';
import { sendOtpSMS } from '../services/sms.service.js';
import { success } from '../utils/response.js';

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  profile: u.profile,
});

export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email && !phone) {
      throw new AppError('Email or phone is required', 400, 'IDENTITY_REQUIRED');
    }
    const or = [];
    if (email) or.push({ email });
    if (phone) or.push({ phone });
    const existing = await User.findOne({ $or: or });
    if (existing) throw new AppError('Account already exists with those details', 409, 'DUPLICATE');
    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, phone, password: hashed });

    if (email) {
      try {
        const pin = user.setRecoveryPin();
        await user.save();
        sendRecoveryPinEmail(email, pin).catch(() => {});
      } catch {
        // non-fatal: user can still reset via other methods
      }
    }

    const token = signToken(user._id);
    success(res, { token, user: publicUser(user) }, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone: email }] }).select('+password');
    if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    const match = await comparePassword(password, user.password);
    if (!match) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    const token = signToken(user._id);
    success(res, { token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    success(res, { user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return success(res, { message: 'If that email exists, a reset link was sent.' });
    }
    const token = user.createResetToken();
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (e) {
      throw new AppError('Could not send reset email', 500, 'EMAIL_FAILED');
    }
    success(res, { message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return success(res, { message: 'If that phone exists, an OTP was sent.' });
    }
    const otp = user.createOTP();
    await user.save();
    try {
      await sendOtpSMS(phone, otp);
    } catch (e) {
      throw new AppError('Could not send OTP', 500, 'SMS_FAILED');
    }
    success(res, { message: 'If that phone exists, an OTP was sent.' });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone }).select('+otp +otpExpires');
    if (!user || !user.otp || !user.otpExpires) {
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }
    if (user.otpExpires < Date.now()) {
      throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
    }
    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }
    success(res, { message: 'OTP verified', verified: true });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordToken = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const crypto = (await import('crypto')).default;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires +password');
    if (!user) throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    user.password = await hashPassword(password);
    user.clearResetFields();
    await user.save();
    success(res, { message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordOtp = async (req, res, next) => {
  try {
    const { phone, otp, password } = req.body;
    const user = await User.findOne({ phone }).select('+otp +otpExpires +password');
    if (!user || !user.otp || !user.otpExpires) {
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }
    if (user.otpExpires < Date.now()) {
      throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
    }
    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }
    user.password = await hashPassword(password);
    user.clearResetFields();
    await user.save();
    success(res, { message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordPin = async (req, res, next) => {
  try {
    const { email, pin, password } = req.body;
    const user = await User.findOne({ email }).select('+recoveryPin +password');
    if (!user || !user.verifyRecoveryPin(pin)) {
      throw new AppError('Invalid recovery PIN', 400, 'INVALID_PIN');
    }
    user.password = await hashPassword(password);
    await user.save();
    success(res, { message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};
