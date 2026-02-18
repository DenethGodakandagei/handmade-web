import express from 'express';
import {
  createCustomizationRequest,
  getMyCustomizationRequests,
  updateCustomizationStatus
} from '../controllers/customizationRequestController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorize('user', 'artisan', 'admin'), upload.single('designImage'), createCustomizationRequest)
  .get(getMyCustomizationRequests);

router
  .route('/:id/status')
  .put(authorize('artisan', 'admin'), updateCustomizationStatus);

export default router;
