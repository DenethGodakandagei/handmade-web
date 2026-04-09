import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAnalytics,
  getTransactions,
  getInventory,
  updateStock,
  getConfig,
  updateConfig,
  getAuditTrail
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management routes
 */

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics config
 */
// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Transactions
router.get('/transactions', getTransactions);

/**
 * @swagger
 * /admin/inventory:
 *   get:
 *     summary: Get full inventory status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory Report
 * /admin/inventory/{id}:
 *   put:
 *     summary: Update inventory stock
 *     tags: [Admin]
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
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.get('/inventory', getInventory);
router.put('/inventory/:id', updateStock);

/**
 * @swagger
 * /admin/config:
 *   get:
 *     summary: Get all platform configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform Configuration
 * /admin/config/{key}:
 *   put:
 *     summary: Update a platform configuration value
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
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
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuration updated
 */
router.get('/config', getConfig);
router.put('/config/:key', updateConfig);

/**
 * @swagger
 * /admin/audit:
 *   get:
 *     summary: Get full admin audit trail
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit Trail
 */
router.get('/audit', getAuditTrail);

export default router;
