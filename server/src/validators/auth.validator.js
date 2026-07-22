import Joi from 'joi';

const phone = Joi.string().pattern(/^\+\d{6,15}$/);

export const signupSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(80).required(),
    email: Joi.string().email().optional(),
    phone: phone.optional(),
    password: Joi.string().min(6).max(128).required(),
  }).or('email', 'phone'),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const forgotEmailSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const forgotPhoneSchema = {
  body: Joi.object({
    phone: phone.required(),
  }),
};

export const verifyOtpSchema = {
  body: Joi.object({
    phone: phone.required(),
    otp: Joi.string().pattern(/^\d{6}$/).required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(128).required(),
  }),
};

export const resetPasswordOtpSchema = {
  body: Joi.object({
    phone: phone.required(),
    otp: Joi.string().pattern(/^\d{6}$/).required(),
    password: Joi.string().min(6).max(128).required(),
  }),
};

export const resetPasswordPinSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    pin: Joi.string().pattern(/^\d{6}$/).required(),
    password: Joi.string().min(6).max(128).required(),
  }),
};
