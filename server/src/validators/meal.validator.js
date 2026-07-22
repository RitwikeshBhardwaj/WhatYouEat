import Joi from 'joi';

const nutritionSchema = Joi.object({
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).default(0),
  carbs: Joi.number().min(0).default(0),
  fat: Joi.number().min(0).default(0),
});

export const createMealSchema = {
  body: Joi.object({
    date: Joi.date().optional(),
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
    label: Joi.string().trim().max(200).required(),
    foodId: Joi.string().allow('').optional(),
    source: Joi.string().valid('usda', 'custom').default('usda'),
    portion: Joi.number().min(0.1).default(1),
    portionUnit: Joi.string().default('serving'),
    nutrition: nutritionSchema.required(),
  }),
};

export const updateMealSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').optional(),
    label: Joi.string().trim().max(200).optional(),
    portion: Joi.number().min(0.1).optional(),
    portionUnit: Joi.string().optional(),
    nutrition: nutritionSchema.optional(),
    date: Joi.date().optional(),
  }),
};

export const mealIdSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const dateRangeSchema = {
  query: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional(),
  }),
};
