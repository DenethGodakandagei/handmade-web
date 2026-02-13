import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('buyer', 'artisan').default('buyer'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
