import express from 'express';
import Announcement from '../models/AnnouncementModel.js';
import { sendSuccess } from '../utils/responseUtils.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Platform announcements
 */

/**
 * @swagger
 * /announcements/active:
 *   get:
 *     summary: Get active announcements
 *     tags: [Announcements]
 *     description: Returns active announcements matching the user's role. Logged-in users see announcements for their role + "all". Public users only see "all" announcements.
 *     responses:
 *       200:
 *         description: List of active announcements
 */
router.get('/active', async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Try to get user role from token (optional auth)
    let userRole = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        userRole = decoded.role;
      } catch { }
    }

    // Build audience filter
    const audienceFilter = ['all'];
    if (userRole === 'user') audienceFilter.push('buyers');
    else if (userRole === 'artisan') audienceFilter.push('artisans');
    else if (userRole === 'admin') audienceFilter.push('buyers', 'artisans'); // Admins see everything

    const announcements = await Announcement.find({
      active: true,
      audience: { $in: audienceFilter }
    })
      .select('title body audience priority createdAt updatedAt visibilityVersion')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    sendSuccess(res, 200, 'Active Announcements', { announcements });
  } catch (error) {
    next(error);
  }
});

export default router;
