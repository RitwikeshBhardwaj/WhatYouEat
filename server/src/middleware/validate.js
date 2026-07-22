import { validate } from '../validators/validate.js';

export const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = validate(schema, {
    body: req.body,
    query: req.query,
    params: req.params,
  });
  if (error) {
    return next(error);
  }
  req.body = value.body ?? req.body;
  req.query = value.query ?? req.query;
  req.params = value.params ?? req.params;
  next();
};
