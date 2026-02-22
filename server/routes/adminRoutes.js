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

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Transactions
router.get('/transactions', getTransactions);

// Inventory
router.get('/inventory', getInventory);
router.put('/inventory/:id', updateStock);

// Platform Config
router.get('/config', getConfig);
router.put('/config/:key', updateConfig);

// Audit Trail
router.get('/audit', getAuditTrail);

export default router;
