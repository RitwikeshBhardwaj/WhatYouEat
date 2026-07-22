import Meal from '../models/Meal.js';
import { AppError } from '../middleware/error.js';
import { success } from '../utils/response.js';
import { startOfUTCDay, last7Days, addDays } from '../utils/dates.js';

const scaleNutrition = (n, portion) => ({
  calories: Math.round(n.calories * portion),
  protein: Math.round(n.protein * portion * 10) / 10,
  carbs: Math.round(n.carbs * portion * 10) / 10,
  fat: Math.round(n.fat * portion * 10) / 10,
});

export const createMeal = async (req, res, next) => {
  try {
    const { date, mealType, label, foodId, source, portion, portionUnit, nutrition } = req.body;
    const day = startOfUTCDay(date || new Date());
    const scaled = scaleNutrition(nutrition, portion);
    const meal = await Meal.create({
      user: req.user._id, date: day, mealType, label, foodId, source,
      portion, portionUnit, nutrition: scaled,
    });
    success(res, { meal }, 201);
  } catch (err) {
    next(err);
  }
};

export const getMeals = async (req, res, next) => {
  try {
    const { start, end } = last7Days();
    const from = req.query.from ? startOfUTCDay(new Date(req.query.from)) : start;
    const to = req.query.to ? startOfUTCDay(new Date(req.query.to)) : end;
    const meals = await Meal.find({ user: req.user._id, date: { $gte: from, $lte: to } })
      .sort({ date: 1, createdAt: 1 });
    success(res, { meals, from, to });
  } catch (err) {
    next(err);
  }
};

export const getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) throw new AppError('Meal not found', 404, 'NOT_FOUND');
    success(res, { meal });
  } catch (err) {
    next(err);
  }
};

export const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) throw new AppError('Meal not found', 404, 'NOT_FOUND');
    const { mealType, label, portion, portionUnit, nutrition, date } = req.body;
    if (mealType) meal.mealType = mealType;
    if (label) meal.label = label;
    if (portionUnit) meal.portionUnit = portionUnit;
    if (date) meal.date = startOfUTCDay(new Date(date));
    if (portion !== undefined) meal.portion = portion;
    if (nutrition) meal.nutrition = scaleNutrition(nutrition, meal.portion);
    await meal.save();
    success(res, { meal });
  } catch (err) {
    next(err);
  }
};

export const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) throw new AppError('Meal not found', 404, 'NOT_FOUND');
    success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

export const getDailySummary = async (req, res, next) => {
  try {
    const { start, end } = last7Days();
    const from = req.query.from ? startOfUTCDay(new Date(req.query.from)) : start;
    const to = req.query.to ? startOfUTCDay(new Date(req.query.to)) : end;

    const byDay = await Meal.aggregate([
      { $match: { user: req.user._id, date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: '$date',
          calories: { $sum: '$nutrition.calories' },
          protein: { $sum: '$nutrition.protein' },
          carbs: { $sum: '$nutrition.carbs' },
          fat: { $sum: '$nutrition.fat' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const today = startOfUTCDay(new Date());
    const todayMeals = await Meal.find({ user: req.user._id, date: today }).sort({ createdAt: 1 });

    const todaySummary = todayMeals.reduce(
      (acc, m) => {
        acc.calories += m.nutrition.calories;
        acc.protein += m.nutrition.protein;
        acc.carbs += m.nutrition.carbs;
        acc.fat += m.nutrition.fat;
        acc.byType[m.mealType].push(m);
        return acc;
      },
      {
        calories: 0, protein: 0, carbs: 0, fat: 0,
        byType: { breakfast: [], lunch: [], dinner: [], snack: [] },
      }
    );

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(from, i);
      const found = byDay.find((b) => new Date(b._id).getTime() === d.getTime());
      days.push({
        date: d,
        calories: found ? Math.round(found.calories) : 0,
        protein: found ? Math.round(found.protein * 10) / 10 : 0,
        carbs: found ? Math.round(found.carbs * 10) / 10 : 0,
        fat: found ? Math.round(found.fat * 10) / 10 : 0,
        count: found ? found.count : 0,
      });
    }

    success(res, {
      today: {
        date: today,
        ...todaySummary,
        byType: todaySummary.byType,
      },
      week: days,
    });
  } catch (err) {
    next(err);
  }
};
