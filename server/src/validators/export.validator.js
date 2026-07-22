import Joi from 'joi';

export const exportRangeSchema = {
  query: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional(),
  }),
};
