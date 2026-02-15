import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
