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

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQ management
 */

/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: Get published FAQs
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: List of published FAQs
 *   post:
 *     summary: Create a FAQ (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               published:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: FAQ created
 */

router.get('/', getPublishedFaqs);

/**
 * @swagger
 * /faqs/admin:
 *   get:
 *     summary: Get all FAQs (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all FAQs
 */
router.get('/admin', protect, authorize('admin'), getAllFaqs);
router.post('/', protect, authorize('admin'), createFaq);

/**
 * @swagger
 * /faqs/{id}:
 *   get:
 *     summary: Get an FAQ by ID (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ details
 *   put:
 *     summary: Update an FAQ (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               published:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: FAQ updated
 *   delete:
 *     summary: Delete an FAQ (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ deleted
 */
router
  .route('/:id')
  .get(protect, authorize('admin'), getFaq)
  .put(protect, authorize('admin'), updateFaq)
  .delete(protect, authorize('admin'), deleteFaq);

export default router;
