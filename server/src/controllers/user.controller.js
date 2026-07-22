import User from '../models/User.js';
import DailyGoal from '../models/DailyGoal.js';
import { AppError } from '../middleware/error.js';
import { success } from '../utils/response.js';
import { startOfUTCDay } from '../utils/dates.js';

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  profile: u.profile,
});

export const getProfile = async (req, res, next) => {
  try {
    success(res, { user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profile } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profile) user.profile = { ...user.profile?.toObject?.() || {}, ...profile };
    await user.save();
    success(res, { user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const setDailyGoal = async (req, res, next) => {
  try {
    const { date, calorieGoal, waterGoal } = req.body;
    const day = startOfUTCDay(date || new Date());
    const goal = await DailyGoal.findOneAndUpdate(
      { user: req.user._id, date: day },
      { user: req.user._id, date: day, calorieGoal, waterGoal: waterGoal ?? 8 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    success(res, { goal });
  } catch (err) {
    next(err);
  }
};

export const getDailyGoal = async (req, res, next) => {
  try {
    const day = startOfUTCDay(req.query.date ? new Date(req.query.date) : new Date());
    const goal = await DailyGoal.findOne({ user: req.user._id, date: day });
    success(res, { goal: goal || { calorieGoal: 2000, waterGoal: 8, date: day } });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    success(res, { user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};
