import express from 'express';
import {
  submitContact,
  getContacts
} from '../controllers/contactController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact form submissions
 */

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Submit a contact message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message submitted
 *   get:
 *     summary: Get all contact messages (Admin only)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 */
router
  .route('/')
  .post(submitContact)
  .get(protect, authorize('admin'), getContacts);

export default router;
