import Joi from 'joi';

export const validate = (schema, data) => {
  const joiSchema = Joi.object({
    body: schema.body || Joi.any(),
    query: schema.query || Joi.any(),
    params: schema.params || Joi.any(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = joiSchema.validate(data, { stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.details = details;
    return { error: err, value };
  }
  return { error: null, value };
};
