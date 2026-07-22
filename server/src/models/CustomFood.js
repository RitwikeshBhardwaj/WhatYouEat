import mongoose from 'mongoose';

const customFoodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    servingSize: { type: String, default: '1 serving' },
    nutrition: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0, default: 0 },
      carbs: { type: Number, required: true, min: 0, default: 0 },
      fat: { type: Number, required: true, min: 0, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('CustomFood', customFoodSchema);
