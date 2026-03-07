import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';

// Include other resource routers
import reviewRouter from './reviewsRoute.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

import { checkCache } from '../middleware/cacheMiddleware.js';

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use('/:productId/reviews', reviewRouter);

// Allow files upload on create/update
// Using fields for multiple file types
const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Handcrafted Vase
 *               description:
 *                 type: string
 *                 example: A beautiful ceramic vase
 *               price:
 *                 type: number
 *                 example: 45.00
 *               stock:
 *                 type: number
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: 65f6c82bbd5e2a14e0a7f34c
 *               location[district]:
 *                 type: string
 *                 example: Colombo
 *               location[area]:
 *                 type: string
 *                 example: Borella
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('artisan', 'admin'), uploadFields, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               location[district]:
 *                 type: string
 *               location[area]:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('artisan', 'admin'), uploadFields, updateProduct)
  .delete(protect, authorize('artisan', 'admin'), deleteProduct);

export default router;
