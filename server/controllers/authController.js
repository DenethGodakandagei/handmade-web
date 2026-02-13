import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as authService from '../services/authService.js';

// @desc      Register user (Buyer or Artisan)
// @route     POST /api/v1/auth/register
// @access    Public
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    sendTokenResponse(user, 200, res);
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
    sendTokenResponse(user, 200, res);
  } catch (err) {
     // Service throws simple errors, wrap them if needed or let global handler catch
     // But login usually needs 401 for invalid credentials which service throws as generic Error
     if (err.message === 'Invalid credentials') {
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
    const user = await User.findById(req.user.id);
    sendSuccess(res, 200, 'Current user', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
export const logout = async (req, res, next) => {
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
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    sendSuccess(res, 200, 'User details updated', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Incorrect password', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  // Placeholder for forgot password logic
  return next(new ErrorResponse('Forgot password not implemented yet', 501));
};

export const resetPassword = async (req, res, next) => {
  // Placeholder for reset password logic
  return next(new ErrorResponse('Reset password not implemented yet', 501));
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
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

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
