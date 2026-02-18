import express from 'express';
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} from '../controllers/reviewsController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

export default router;
