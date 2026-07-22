import crypto from 'crypto';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    recoveryPin: { type: String, select: false },

    profile: {
      heightCm: { type: Number, min: 50, max: 300 },
      weightKg: { type: Number, min: 20, max: 400 },
      age: { type: Number, min: 1, max: 120 },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'sedentary',
      },
      gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    },
  },
  { timestamps: true }
);

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return token;
};

userSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

userSchema.methods.setRecoveryPin = function () {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  this.recoveryPin = crypto.createHash('sha256').update(pin).digest('hex');
  return pin;
};

userSchema.methods.verifyRecoveryPin = function (pin) {
  if (!this.recoveryPin) return false;
  const hash = crypto.createHash('sha256').update(pin).digest('hex');
  return hash === this.recoveryPin;
};

userSchema.methods.clearResetFields = function () {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  this.otp = undefined;
  this.otpExpires = undefined;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  next();
});

export default mongoose.model('User', userSchema);
