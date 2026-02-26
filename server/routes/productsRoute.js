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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The product ID
 *                   name:
 *                     type: string
 *                     description: The product name
 */
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('artisan', 'admin'), uploadFields, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('artisan', 'admin'), uploadFields, updateProduct)
  .delete(protect, authorize('artisan', 'admin'), deleteProduct);

export default router;
