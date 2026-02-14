
import Joi from 'joi';

export const becomeSellerSchema = Joi.object({
  studioName: Joi.string().required().min(2).max(100),
  telephone: Joi.string().pattern(/^[0-9+\s-]{8,20}$/).required().messages({
    'string.pattern.base': 'Telephone must be valid number'
  }),
  portfolio: Joi.string().uri().allow('').optional(),
  category: Joi.string().required(),
  location: Joi.string().required(),
  experience: Joi.string().required(),
  skills: Joi.array().items(Joi.string()).optional(),
  process: Joi.string().required().min(10).max(2000)
});
