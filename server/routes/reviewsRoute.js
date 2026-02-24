import express from 'express';
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  replyReview
} from '../controllers/reviewsController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { reviewsGate } from '../middleware/platformGates.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('user', 'admin'), reviewsGate, addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

router
  .route('/:id/reply')
  .post(protect, authorize('artisan', 'admin'), replyReview);

export default router;
