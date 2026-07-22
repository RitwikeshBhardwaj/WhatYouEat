import Joi from 'joi';

export const searchFoodSchema = {
  query: Joi.object({
    q: Joi.string().trim().min(1).max(200).required(),
    page: Joi.number().min(0).default(0),
  }),
};
