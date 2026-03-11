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

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of reviews
 *   post:
 *     summary: Add a review (User/Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               rating:
 *                 type: number
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 */
router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('user', 'admin'), reviewsGate, addReview);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
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
 *               rating:
 *                 type: number
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
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
 *         description: Review deleted
 */
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

/**
 * @swagger
 * /reviews/{id}/reply:
 *   post:
 *     summary: Reply to a review (Artisan/Admin)
 *     tags: [Reviews]
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
 *               artisanReply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply added
 */
router
  .route('/:id/reply')
  .post(protect, authorize('artisan', 'admin'), replyReview);

export default router;
