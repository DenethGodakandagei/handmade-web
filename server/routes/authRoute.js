import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
