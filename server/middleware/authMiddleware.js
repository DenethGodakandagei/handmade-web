import jwt from 'jsonwebtoken';
import { ErrorResponse } from '../utils/responseUtils.js';
import User from '../models/UserModel.js';
import logger from '../utils/logger.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    // FIX [HIGH-4]: Token may be valid but the account was deleted after issuance.
    // Without this check req.user is null, crashing authorize() with a TypeError.
    if (!req.user) {
      return next(new ErrorResponse('User account no longer exists', 401));
    }

    next();
  } catch (err) {
    logger.error(err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    // FIX [HIGH-4]: Guard against req.user being null (e.g. deleted account slipping through)
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user?.role ?? 'unknown'} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
