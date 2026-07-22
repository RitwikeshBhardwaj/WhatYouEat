import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[mongo] connected: ${mongoose.connection.host}`);
  if (process.env.NODE_ENV !== 'production') {
    try {
      const dropped = await mongoose.connection.syncIndexes();
      if (dropped && dropped.length) console.log('[mongo] synced indexes:', dropped);
    } catch (e) {
      console.warn('[mongo] index sync skipped:', e.message);
    }
  }
};
