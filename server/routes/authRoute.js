import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updateProfilePicture,
  updatePassword,
  logout,
  becomeSeller,
  getAllApplications,
  approveApplication,
  rejectApplication,
  googleCallback
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';
import { becomeSellerSchema } from '../validation/sellerValidation.js';
import { signupFreezeGate } from '../middleware/platformGates.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', signupFreezeGate, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updateprofilepicture', protect, upload.single('profilePicture'), updateProfilePicture);
router.put('/updatepassword', protect, updatePassword);
router.put('/becomeseller', protect, validate(becomeSellerSchema), becomeSeller);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/applications', protect, getAllApplications);
router.put('/applications/:id/approve', protect, approveApplication);
router.put('/applications/:id/reject', protect, rejectApplication);

// ─── Google OAuth 2.0 / OpenID Connect ──────────────────────────────────────

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth 2.0 login (Authorization Code flow)
 *     tags: [Auth]
 *     description: Redirects the user to Google's consent screen. On approval,
 *       Google redirects back to /auth/google/callback with an authorization code.
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get('/google', (req, res, next) => {
  // Generate a random state token to prevent CSRF
  const state = crypto.randomBytes(32).toString('hex');
  
  // Detect origin from referer or query
  let clientOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
  const referer = req.headers?.referer;
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        clientOrigin = url.origin;
      }
    } catch { }
  }

  // Store state and return origin in short-lived cookies
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000  // 5 minutes
  });

  res.cookie('oauth_origin', clientOrigin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000
  });

  passport.authenticate('google', {
    scope: ['openid', 'profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
    state
  })(req, res, next);
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback (exchanges authorization code for tokens)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: CSRF state token
 *     responses:
 *       302:
 *         description: Redirects to client with JWT token
 *       401:
 *         description: Authentication failed
 */
router.get('/google/callback', (req, res, next) => {
  const clientOrigin = req.cookies?.oauth_origin || process.env.CLIENT_URL || 'http://localhost:3000';
  const stateFromGoogle = req.query.state;
  const stateFromCookie = req.cookies?.oauth_state;
  res.clearCookie('oauth_state');
  res.clearCookie('oauth_origin');

  if (!stateFromGoogle || !stateFromCookie || stateFromGoogle !== stateFromCookie) {
    return res.redirect(`${clientOrigin}/oauth/callback?error=invalid_state`);
  }

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${clientOrigin}/oauth/callback?error=auth_failed`);
    }
    req.user = user;
    return googleCallback(req, res);
  })(req, res, next);
});

export default router;

