import express from 'express';
import {
  getPublishedFaqs,
  getAllFaqs,
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq
} from '../controllers/faqController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublishedFaqs);
router.get('/admin', protect, authorize('admin'), getAllFaqs);
router.post('/', protect, authorize('admin'), createFaq);

router
  .route('/:id')
  .get(protect, authorize('admin'), getFaq)
  .put(protect, authorize('admin'), updateFaq)
  .delete(protect, authorize('admin'), deleteFaq);

export default router;
