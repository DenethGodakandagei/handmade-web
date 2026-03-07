import express from 'express';
import {
  createCustomizationRequest,
  getMyCustomizationRequests,
  updateCustomizationStatus
} from '../controllers/customizationRequestController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { customizationsGate } from '../middleware/platformGates.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: CustomizationRequests
 *   description: Customization request management
 */

/**
 * @swagger
 * /customizations:
 *   post:
 *     summary: Create a customization request
 *     tags: [CustomizationRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               customizations:
 *                 type: string
 *               customMessage:
 *                 type: string
 *               designImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Request created
 *   get:
 *     summary: Get user's customization requests
 *     tags: [CustomizationRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
 */
router
  .route('/')
  .post(authorize('user', 'artisan', 'admin'), customizationsGate, upload.single('designImage'), createCustomizationRequest)
  .get(getMyCustomizationRequests);

/**
 * @swagger
 * /customizations/{id}/status:
 *   put:
 *     summary: Update customization request status (Artisan/Admin)
 *     tags: [CustomizationRequests]
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
 *               status:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Status updated
 */
router
  .route('/:id/status')
  .put(authorize('artisan', 'admin'), updateCustomizationStatus);

export default router;
