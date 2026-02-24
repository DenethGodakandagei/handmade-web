import express from 'express';
import { getMetrics, getNodes } from '../controllers/systemController.js';
import { getSystemLogs } from '../controllers/logController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getMetrics);
router.get('/nodes', getNodes);
router.get('/logs', getSystemLogs);

export default router;
