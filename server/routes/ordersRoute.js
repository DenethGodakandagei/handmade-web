import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/ordersController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { preordersGate } from '../middleware/platformGates.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *   get:
 *     summary: Get all orders (Admin/Artisan)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.route('/')
  .post(preordersGate, createOrder)
  .get(authorize('admin', 'artisan'), getOrders); // Artisan gets filtered view

/**
 * @swagger
 * /orders/myorders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's orders
 */
router.route('/myorders').get(getMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
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
 *         description: Order details
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
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
 *         description: Order deleted
 */
router.route('/:id').get(getOrder).delete(deleteOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update an order's status
 *     tags: [Orders]
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
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.route('/:id/status').put(authorize('admin', 'artisan'), updateOrderStatus);

export default router;
