import express from 'express';
import {
  submitContact,
  getContacts
} from '../controllers/contactController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(submitContact)
  .get(protect, authorize('admin'), getContacts);

export default router;
