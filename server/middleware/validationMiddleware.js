import logger from '../config/logger.js';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.warn(`Validation failed: ${errorMessages.join(', ')}`);
    return res.status(400).json({
      success: false,
      errors: errorMessages,
    });
  }
  next();
};
