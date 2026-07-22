import CustomFood from '../models/CustomFood.js';
import { AppError } from '../middleware/error.js';
import { success } from '../utils/response.js';

export const createCustomFood = async (req, res, next) => {
  try {
    const { name, servingSize, nutrition } = req.body;
    const food = await CustomFood.create({ user: req.user._id, name, servingSize, nutrition });
    success(res, { food }, 201);
  } catch (err) {
    next(err);
  }
};

export const getCustomFoods = async (req, res, next) => {
  try {
    const foods = await CustomFood.find({ user: req.user._id }).sort({ createdAt: -1 });
    success(res, { foods });
  } catch (err) {
    next(err);
  }
};

export const getCustomFood = async (req, res, next) => {
  try {
    const food = await CustomFood.findOne({ _id: req.params.id, user: req.user._id });
    if (!food) throw new AppError('Custom food not found', 404, 'NOT_FOUND');
    success(res, { food });
  } catch (err) {
    next(err);
  }
};

export const updateCustomFood = async (req, res, next) => {
  try {
    const { name, servingSize, nutrition } = req.body;
    const food = await CustomFood.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { ...(name ? { name } : {}), ...(servingSize ? { servingSize } : {}), ...(nutrition ? { nutrition } : {}) } },
      { new: true }
    );
    if (!food) throw new AppError('Custom food not found', 404, 'NOT_FOUND');
    success(res, { food });
  } catch (err) {
    next(err);
  }
};

export const deleteCustomFood = async (req, res, next) => {
  try {
    const food = await CustomFood.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!food) throw new AppError('Custom food not found', 404, 'NOT_FOUND');
    success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};
