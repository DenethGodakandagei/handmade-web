import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getThreats,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  getTraffic,
  getSessions,
  killSession,
  killUserSessions,
  getEnvironment,
  getDependencies,
  getCronJobs
} from '../controllers/securityOpsController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Threat Intelligence
router.get('/threats', getThreats);

// IP Blacklist
router.route('/blacklist')
  .get(getBlacklist)
  .post(addToBlacklist);
router.delete('/blacklist/:id', removeFromBlacklist);

// Live Traffic
router.get('/traffic', getTraffic);

// Session Inspector
router.get('/sessions', getSessions);
router.delete('/sessions/:id', killSession);
router.delete('/sessions/user/:userId', killUserSessions);

// Environment Audit
router.get('/environment', getEnvironment);

// Dependency Audit
router.get('/dependencies', getDependencies);

// Cron Monitor
router.get('/cron', getCronJobs);

export default router;
