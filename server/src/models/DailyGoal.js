import mongoose from 'mongoose';

const dailyGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    calorieGoal: { type: Number, required: true, min: 0, default: 2000 },
    waterGoal: { type: Number, required: true, min: 0, default: 8 },
  },
  { timestamps: true }
);

dailyGoalSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyGoal', dailyGoalSchema);
