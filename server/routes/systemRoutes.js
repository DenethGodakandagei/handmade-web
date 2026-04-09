import express from 'express';
import { getMetrics, getNodes } from '../controllers/systemController.js';
import { getSystemLogs } from '../controllers/logController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System metrics and logs (Admin only)
 */

/**
 * @swagger
 * /system/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics
 * /system/nodes:
 *   get:
 *     summary: Get system nodes
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System nodes
 * /system/logs:
 *   get:
 *     summary: Get system logs
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System logs
 */
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getMetrics);
router.get('/nodes', getNodes);
router.get('/logs', getSystemLogs);

export default router;
