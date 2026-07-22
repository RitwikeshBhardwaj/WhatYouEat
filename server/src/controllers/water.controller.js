import WaterLog from '../models/WaterLog.js';
import { success } from '../utils/response.js';
import { startOfUTCDay, addDays, last7Days } from '../utils/dates.js';

export const setWater = async (req, res, next) => {
  try {
    const day = startOfUTCDay(req.body.date || new Date());
    const glasses = req.body.glasses;
    const log = await WaterLog.findOneAndUpdate(
      { user: req.user._id, date: day },
      { user: req.user._id, date: day, glasses },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    success(res, { log });
  } catch (err) {
    next(err);
  }
};

export const addWater = async (req, res, next) => {
  try {
    const day = startOfUTCDay(req.body.date || new Date());
    const delta = req.body.delta;
    const log = await WaterLog.findOneAndUpdate(
      { user: req.user._id, date: day },
      { $inc: { glasses: delta } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    success(res, { log });
  } catch (err) {
    next(err);
  }
};

export const getWater = async (req, res, next) => {
  try {
    const day = startOfUTCDay(req.query.date ? new Date(req.query.date) : new Date());
    const log = await WaterLog.findOne({ user: req.user._id, date: day });
    success(res, { log: log || { date: day, glasses: 0 }, goal: 8 });
  } catch (err) {
    next(err);
  }
};

export const getWaterWeek = async (req, res, next) => {
  try {
    const { start, end } = last7Days();
    const logs = await WaterLog.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const map = new Map(logs.map((l) => [l.date.getTime(), l.glasses]));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      days.push({ date: d, glasses: map.get(d.getTime()) || 0 });
    }
    success(res, { days, goal: 8 });
  } catch (err) {
    next(err);
  }
};
