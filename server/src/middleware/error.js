export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL', details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, code = 'INTERNAL', message, details } = err;

  if (err?.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.details || err.errors;
  } else if (err?.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid or malformed token';
  } else if (err?.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  } else if (err?.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE';
    message = 'A resource with that value already exists';
    details = err.keyValue;
  } else if (!err.isOperational) {
    code = 'INTERNAL';
    message = 'Something went wrong';
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  });
};
