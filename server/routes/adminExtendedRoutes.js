import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  globalSearch,
  getNotifications,
  markNotificationRead,
  getGeoRevenue,
  exportData,
  getUserProfile,
  getModerationQueue,
  moderateProduct,
  moderateReview,
  getVerificationQueue,
  verifyArtisan,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement
} from '../controllers/adminExtendedController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Global Search (⌘K)
router.get('/search', globalSearch);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

// Geographic Revenue
router.get('/geo', getGeoRevenue);

// Export Center
router.get('/export/:type', exportData);

// User Deep Profile
router.get('/profile/:id', getUserProfile);

// Content Moderation
router.get('/moderation', getModerationQueue);
router.put('/moderation/product/:id', moderateProduct);
router.put('/moderation/review/:id', moderateReview);

// Artisan Verification
router.get('/verification', getVerificationQueue);
router.put('/verification/:id', verifyArtisan);

// Announcements
router.route('/announcements')
  .get(getAnnouncements)
  .post(createAnnouncement);
router.put('/announcements/:id/toggle', toggleAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

export default router;
