import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus
} from '../controllers/ordersController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { preordersGate } from '../middleware/platformGates.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(preordersGate, createOrder)
  .get(authorize('admin', 'artisan'), getOrders); // Artisan gets filtered view

router.route('/myorders').get(getMyOrders);

router.route('/:id').get(getOrder);

router.route('/:id/status').put(authorize('admin'), updateOrderStatus);

export default router;
