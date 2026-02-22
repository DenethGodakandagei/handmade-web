import PlatformConfig from '../models/PlatformConfigModel.js';
import { ErrorResponse } from '../utils/responseUtils.js';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

/**
 * In-memory config cache with 30-second TTL.
 * Prevents a DB query on every single request while still
 * reflecting admin changes within half a minute.
 */
let configCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

const loadConfig = async () => {
  const now = Date.now();
  if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache;
  }
  try {
    const configs = await PlatformConfig.find().lean();
    const map = {};
    configs.forEach(c => { map[c.key] = c.value; });
    configCache = map;
    cacheTimestamp = now;
    return map;
  } catch (err) {
    // If DB is down, fail open (don't block the whole site)
    console.error('PlatformConfig load failed:', err.message);
    return configCache || {};
  }
};

/**
 * Force-clear the cache so the next request reads fresh from DB.
 * Call this from the config update controller.
 */
export const invalidateConfigCache = () => {
  configCache = null;
  cacheTimestamp = 0;
};

/**
 * Extracts the user role from the JWT token without going through
 * the full protect middleware, so we can let admins bypass maintenance.
 */
const extractRole = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role').lean();
    return user?.role || null;
  } catch {
    return null;
  }
};

// ─── MAINTENANCE MODE ────────────────────────────────────
/**
 * If maintenance_mode is ON, block ALL non-admin requests.
 * Admins can still access everything (they need to turn it off).
 * Applied globally in app.js.
 */
export const maintenanceGate = async (req, res, next) => {
  try {
    const config = await loadConfig();
    if (!config.maintenance_mode) return next();

    // Let admin routes and system routes through regardless
    if (req.originalUrl.startsWith('/api/v1/admin') || req.originalUrl.startsWith('/api/v1/system')) {
      return next();
    }

    // Let login through so admins can authenticate
    if (req.originalUrl === '/api/v1/auth/login') {
      return next();
    }

    // Check if the requester is an admin
    const role = await extractRole(req);
    if (role === 'admin') return next();

    // Block everyone else
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: 'System is currently under maintenance. Please try again later.',
      maintenance: true
    });
  } catch (err) {
    // Fail open - don't crash the app
    next();
  }
};

// ─── SIGNUP FREEZE ───────────────────────────────────────
/**
 * If signup_freeze is ON, block the register endpoint.
 * Applied specifically on the auth register route.
 */
export const signupFreezeGate = async (req, res, next) => {
  try {
    const config = await loadConfig();
    if (config.signup_freeze) {
      return next(new ErrorResponse('New registrations are temporarily suspended by the platform administrator.', 403));
    }
    next();
  } catch (err) {
    next();
  }
};

// ─── FEATURE GATES ───────────────────────────────────────
/**
 * Block review creation if allow_reviews is OFF.
 */
export const reviewsGate = async (req, res, next) => {
  try {
    const config = await loadConfig();
    if (config.allow_reviews === false) {
      return next(new ErrorResponse('Product reviews are currently disabled by the platform administrator.', 403));
    }
    next();
  } catch (err) {
    next();
  }
};

/**
 * Block customization requests if allow_customizations is OFF.
 */
export const customizationsGate = async (req, res, next) => {
  try {
    const config = await loadConfig();
    if (config.allow_customizations === false) {
      return next(new ErrorResponse('Customization requests are currently disabled by the platform administrator.', 403));
    }
    next();
  } catch (err) {
    next();
  }
};

/**
 * Block pre-order purchases if allow_preorders is OFF.
 * This is checked in the order creation flow.
 */
export const preordersGate = async (req, res, next) => {
  try {
    const config = await loadConfig();
    if (config.allow_preorders === false) {
      // Check if the order contains pre-order items
      // If it does, block it
      // For now, attach the flag so controllers can check
      req.preordersAllowed = false;
    } else {
      req.preordersAllowed = true;
    }
    next();
  } catch (err) {
    req.preordersAllowed = true;
    next();
  }
};
