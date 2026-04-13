import express from 'express';
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
  rejectApplication
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

export default router;
