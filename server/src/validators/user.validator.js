import Joi from 'joi';

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(80).optional(),
    phone: Joi.string().allow('').optional(),
    profile: Joi.object({
      heightCm: Joi.number().min(50).max(300).optional(),
      weightKg: Joi.number().min(20).max(400).optional(),
      age: Joi.number().min(1).max(120).optional(),
      activityLevel: Joi.string()
        .valid('sedentary', 'light', 'moderate', 'active', 'very_active')
        .optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
    }).optional(),
  }),
};

export const setGoalSchema = {
  body: Joi.object({
    date: Joi.date().optional(),
    calorieGoal: Joi.number().min(0).max(10000).required(),
    waterGoal: Joi.number().min(0).max(50).optional(),
  }),
};
