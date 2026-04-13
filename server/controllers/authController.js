import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as authService from '../services/authService.js';
import FailedLogin from '../models/FailedLoginModel.js';
import ActiveSession from '../models/ActiveSessionModel.js';
import BlacklistedIP from '../models/BlacklistedIPModel.js';
import crypto from 'crypto';

// Parse basic device info from User-Agent
const parseUA = (ua) => {
  let browser = 'Unknown', os = 'Unknown', device = 'Desktop';
  if (!ua) return { browser, os, device };

  // Browser detection
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  // OS detection
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
};

const AUTO_BLOCK_THRESHOLD = 15; // Block IP after 15 failed attempts in 1 hour

// @desc      Register user (Buyer or Artisan)
// @route     POST /api/v1/auth/register
// @access    Public
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    sendTokenResponse(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await authService.loginUser(email, password);
    sendTokenResponse(user, 200, res, req);
  } catch (err) {
     if (err.message === 'Invalid credentials') {
        // Track the failed login attempt
        const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';
        const ip = rawIp.split(',')[0].replace('::ffff:', '');

        FailedLogin.create({
          email: req.body.email,
          ip,
          userAgent: req.headers['user-agent'] || '',
          reason: 'invalid_credentials'
        }).catch(() => {}); // Non-blocking

        // Auto-block IP after threshold
        FailedLogin.countDocuments({
          ip,
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        }).then(async (count) => {
          if (count >= AUTO_BLOCK_THRESHOLD) {
            const exists = await BlacklistedIP.findOne({ ip });
            if (!exists) {
              await BlacklistedIP.create({
                ip,
                reason: `Auto-blocked: ${count} failed login attempts in 1 hour`,
                autoBlocked: true
              });
            }
          }
        }).catch(() => {});

        return next(new ErrorResponse('Invalid credentials', 401));
     }
    next(err);
  }
};

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    sendSuccess(res, 200, 'Current user', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
export const logout = async (req, res, next) => {
  // Remove session tracking
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    ActiveSession.deleteOne({ tokenHash }).catch(() => {});
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  sendSuccess(res, 200, 'User logged out successfully');
};

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
export const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      studioName: req.body.studioName,
      location: req.body.location,
      telephone: req.body.telephone,
      category: req.body.category,
      skills: req.body.skills,
      experience: req.body.experience,
      portfolio: req.body.portfolio
    };

    const user = await authService.updateUserDetails(req.user.id, fieldsToUpdate);

    sendSuccess(res, 200, 'User details updated', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Update profile picture
// @route     PUT /api/v1/auth/updateprofilepicture
// @access    Private
export const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const fieldsToUpdate = {
      profilePicture: req.file.path
    };

    const user = await authService.updateUserDetails(req.user.id, fieldsToUpdate);

    sendSuccess(res, 200, 'Profile picture updated', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await authService.updateUserPassword(req.user.id, req.body.currentPassword, req.body.newPassword);

    sendTokenResponse(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  return next(new ErrorResponse('Forgot password not implemented yet', 501));
};

export const resetPassword = async (req, res, next) => {
  return next(new ErrorResponse('Reset password not implemented yet', 501));
};

// @desc      Submit seller application
// @route     PUT /api/v1/auth/becomeseller
// @access    Private
export const becomeSeller = async (req, res, next) => {
  try {
    const user = await authService.becomeSeller(req.user.id, req.body);
    sendSuccess(res, 200, 'Seller application submitted', user);
  } catch (err) {
    next(err);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const users = await authService.getAllApplications();
    sendSuccess(res, 200, 'Applications retrieved', users);
  } catch (err) {
    next(err);
  }
};

export const approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.approveApplication(id);
    sendSuccess(res, 200, 'Application approved', user);
  } catch (err) {
    next(err);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.rejectApplication(id);
    sendSuccess(res, 200, 'Application rejected', user);
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, req) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Track active session (non-blocking)
  if (req) {
    const rawIp = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';
    const ip = rawIp.split(',')[0].replace('::ffff:', '');
    const ua = req.headers?.['user-agent'] || '';
    const { browser, os, device } = parseUA(ua);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    ActiveSession.findOneAndUpdate(
      { tokenHash },
      {
        user: user._id,
        token: tokenHash, // Store hash only
        tokenHash,
        ip,
        userAgent: ua,
        device,
        browser,
        os,
        lastActivity: new Date()
      },
      { upsert: true, new: true }
    ).catch(() => {}); // Non-blocking
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
