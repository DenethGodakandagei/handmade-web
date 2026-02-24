import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getPublicArtisans,
  getPublicArtisan
} from '../controllers/usersController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/artisans/all', getPublicArtisans);
router.get('/artisans/:id', getPublicArtisan);

// Protected Admin routes
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
