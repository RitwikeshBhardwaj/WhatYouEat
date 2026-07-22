import mongoose from 'mongoose';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    mealType: { type: String, enum: MEAL_TYPES, required: true },
    label: { type: String, required: true, trim: true },
    foodId: { type: String, default: '' },
    source: { type: String, enum: ['usda', 'custom'], default: 'usda' },
    portion: { type: Number, required: true, default: 1, min: 0.1 },
    portionUnit: { type: String, default: 'serving' },
    nutrition: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0, default: 0 },
      carbs: { type: Number, required: true, min: 0, default: 0 },
      fat: { type: Number, required: true, min: 0, default: 0 },
    },
  },
  { timestamps: true }
);

mealSchema.index({ user: 1, date: 1 });

export const MEAL_TYPES_LIST = MEAL_TYPES;
export default mongoose.model('Meal', mealSchema);
