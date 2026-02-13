import { get } from '../utils/cacheService.js';

/**
 * Cache Middleware
 * - Key: Based on `req.originalUrl`
 * - Result: Returns cached JSON directly if found.
 */
export const checkCache = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.query.noCache) return next();
  
  const key = req.originalUrl;
  const cachedResponse = get(key);

  if (cachedResponse) {
    return res.status(200).json({
      success: true,
      message: 'From Cache',
      data: cachedResponse
    });
  }
  
  req.cacheKey = key;
  next();
};
