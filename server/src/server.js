import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5050;

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] running on :${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    console.error('[mongo] connection failed', err);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
});
