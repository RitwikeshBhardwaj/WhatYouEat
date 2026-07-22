import Joi from 'joi';

const nutritionSchema = Joi.object({
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).default(0),
  carbs: Joi.number().min(0).default(0),
  fat: Joi.number().min(0).default(0),
});

export const createCustomFoodSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(120).required(),
    servingSize: Joi.string().default('1 serving'),
    nutrition: nutritionSchema.required(),
  }),
};

export const updateCustomFoodSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    name: Joi.string().trim().max(120).optional(),
    servingSize: Joi.string().optional(),
    nutrition: nutritionSchema.optional(),
  }),
};

export const idSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
