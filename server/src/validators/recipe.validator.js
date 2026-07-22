import Joi from 'joi';

export const analyzeRecipeSchema = {
  body: Joi.object({
    input: Joi.string().trim().min(3).max(5000).required(),
    type: Joi.string().valid('text', 'url').default('text'),
    servings: Joi.number().integer().min(1).max(20).default(8),
  }).or('input'),
};

export const recipeUrlSchema = {
  body: Joi.object({
    url: Joi.string().uri().required(),
    type: Joi.string().valid('url').default('url'),
  }),
};
