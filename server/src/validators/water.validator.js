import Joi from 'joi';

export const waterSchema = {
  body: Joi.object({
    date: Joi.date().optional(),
    glasses: Joi.number().integer().min(0).max(50).required(),
  }),
};

export const waterAddSchema = {
  body: Joi.object({
    date: Joi.date().optional(),
    delta: Joi.number().integer().min(-50).max(50).required(),
  }),
};

export const dateSchema = {
  query: Joi.object({ date: Joi.date().optional() }),
};
