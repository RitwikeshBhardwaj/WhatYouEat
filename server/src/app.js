import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound, errorHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import mealRoutes from './routes/meal.routes.js';
import foodRoutes from './routes/food.routes.js';
import customFoodRoutes from './routes/customFood.routes.js';
import waterRoutes from './routes/water.routes.js';
import recipeRoutes from './routes/recipe.routes.js';
import exportRoutes from './routes/export.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://what-you-eat-tau.vercel.app',
].filter(Boolean);

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/custom-foods', customFoodRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/export', exportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
