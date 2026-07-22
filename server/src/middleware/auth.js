import jwt from 'jsonwebtoken';
import { AppError } from './error.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -otp');
    if (!user) throw new AppError('User no longer exists', 401, 'UNAUTHORIZED');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
};

export const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
