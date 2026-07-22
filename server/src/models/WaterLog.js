import mongoose from 'mongoose';

const waterLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    glasses: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('WaterLog', waterLogSchema);
