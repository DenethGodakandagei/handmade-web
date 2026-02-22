import BlacklistedIP from '../models/BlacklistedIPModel.js';
import FailedLogin from '../models/FailedLoginModel.js';
import ActiveSession from '../models/ActiveSessionModel.js';
import { sendSuccess, ErrorResponse } from '../utils/responseUtils.js';
import { recordAudit } from '../utils/auditLogger.js';
import { getTrafficSnapshot } from '../middleware/trafficTracker.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── THREAT INTELLIGENCE ─────────────────────────────────

/**
 * @desc    Get all failed login attempts with aggregated threat data
 * @route   GET /api/v1/admin/security/threats
 * @access  Private/Admin
 */
export const getThreats = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      FailedLogin.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FailedLogin.countDocuments()
    ]);

    // Top offending IPs (most failed logins)
    const topOffenders = await FailedLogin.aggregate([
      { $group: { _id: '$ip', count: { $sum: 1 }, emails: { $addToSet: '$email' }, lastAttempt: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Top targeted emails
    const topTargetedEmails = await FailedLogin.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 }, ips: { $addToSet: '$ip' }, lastAttempt: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Last 24 hours count
    const last24h = await FailedLogin.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Last 1 hour count
    const lastHour = await FailedLogin.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    sendSuccess(res, 200, 'Threat Intelligence', {
      attempts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: { total, last24h, lastHour },
      topOffenders,
      topTargetedEmails
    });
  } catch (error) {
    next(error);
  }
};

// ─── IP BLACKLIST ────────────────────────────────────────

/**
 * @desc    Get all blacklisted IPs
 * @route   GET /api/v1/admin/security/blacklist
 * @access  Private/Admin
 */
export const getBlacklist = async (req, res, next) => {
  try {
    const ips = await BlacklistedIP.find()
      .populate('blockedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, 200, 'IP Blacklist', { ips, total: ips.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add IP to blacklist
 * @route   POST /api/v1/admin/security/blacklist
 * @access  Private/Admin
 */
export const addToBlacklist = async (req, res, next) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) return next(new ErrorResponse('IP address is required', 400));

    // Validate IP format (basic)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return next(new ErrorResponse('Invalid IPv4 address format', 400));

    // Check if already blacklisted
    const existing = await BlacklistedIP.findOne({ ip });
    if (existing) return next(new ErrorResponse('IP is already blacklisted', 409));

    const entry = await BlacklistedIP.create({
      ip,
      reason: reason || 'Manual block by administrator',
      blockedBy: req.user.id,
      autoBlocked: false
    });

    await recordAudit({
      actor: req.user.id,
      action: 'CONFIG_UPDATE',
      description: `Blacklisted IP: ${ip} — Reason: ${reason || 'Manual block'}`,
      metadata: { ip, reason },
      req,
      severity: 'high'
    });

    sendSuccess(res, 201, 'IP blacklisted', entry);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove IP from blacklist
 * @route   DELETE /api/v1/admin/security/blacklist/:id
 * @access  Private/Admin
 */
export const removeFromBlacklist = async (req, res, next) => {
  try {
    const entry = await BlacklistedIP.findByIdAndDelete(req.params.id);
    if (!entry) return next(new ErrorResponse('Blacklist entry not found', 404));

    await recordAudit({
      actor: req.user.id,
      action: 'CONFIG_UPDATE',
      description: `Removed IP from blacklist: ${entry.ip}`,
      metadata: { ip: entry.ip },
      req,
      severity: 'medium'
    });

    sendSuccess(res, 200, 'IP removed from blacklist');
  } catch (error) {
    next(error);
  }
};

// ─── TRAFFIC MONITOR ─────────────────────────────────────

/**
 * @desc    Get live traffic data
 * @route   GET /api/v1/admin/security/traffic
 * @access  Private/Admin
 */
export const getTraffic = async (req, res, next) => {
  try {
    const snapshot = getTrafficSnapshot();
    sendSuccess(res, 200, 'Live Traffic Monitor', snapshot);
  } catch (error) {
    next(error);
  }
};

// ─── SESSION INSPECTOR ───────────────────────────────────

/**
 * @desc    Get all active sessions
 * @route   GET /api/v1/admin/security/sessions
 * @access  Private/Admin
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await ActiveSession.find()
      .populate('user', 'name email role profilePicture')
      .sort({ lastActivity: -1 })
      .lean();

    // Group by user
    const byUser = {};
    sessions.forEach(s => {
      const userId = s.user?._id?.toString() || 'unknown';
      if (!byUser[userId]) {
        byUser[userId] = { user: s.user, sessions: [], count: 0 };
      }
      byUser[userId].sessions.push(s);
      byUser[userId].count++;
    });

    sendSuccess(res, 200, 'Active Sessions', {
      sessions,
      total: sessions.length,
      uniqueUsers: Object.keys(byUser).length,
      byUser: Object.values(byUser)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kill a specific session
 * @route   DELETE /api/v1/admin/security/sessions/:id
 * @access  Private/Admin
 */
export const killSession = async (req, res, next) => {
  try {
    const session = await ActiveSession.findByIdAndDelete(req.params.id).populate('user', 'name email');
    if (!session) return next(new ErrorResponse('Session not found', 404));

    await recordAudit({
      actor: req.user.id,
      action: 'SESSION_PURGE',
      target: session.user?._id,
      targetModel: 'User',
      description: `Killed session for ${session.user?.name || 'Unknown'} (${session.ip})`,
      metadata: { ip: session.ip, device: session.device },
      req,
      severity: 'high'
    });

    sendSuccess(res, 200, 'Session terminated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kill all sessions for a specific user
 * @route   DELETE /api/v1/admin/security/sessions/user/:userId
 * @access  Private/Admin
 */
export const killUserSessions = async (req, res, next) => {
  try {
    const result = await ActiveSession.deleteMany({ user: req.params.userId });

    await recordAudit({
      actor: req.user.id,
      action: 'SESSION_PURGE',
      target: req.params.userId,
      targetModel: 'User',
      description: `Purged all sessions for user ${req.params.userId} (${result.deletedCount} sessions)`,
      req,
      severity: 'critical'
    });

    sendSuccess(res, 200, `${result.deletedCount} sessions terminated`);
  } catch (error) {
    next(error);
  }
};

// ─── ENVIRONMENT AUDIT ───────────────────────────────────

/**
 * @desc    Get sanitized environment variables and runtime info
 * @route   GET /api/v1/admin/security/environment
 * @access  Private/Admin
 */
export const getEnvironment = async (req, res, next) => {
  try {
    // Sanitize env vars: show keys but mask secrets
    const sensitiveKeys = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN', 'PRIVATE', 'CREDENTIAL'];
    const envVars = {};

    Object.keys(process.env).forEach(key => {
      const isSensitive = sensitiveKeys.some(s => key.toUpperCase().includes(s));
      if (isSensitive) {
        const val = process.env[key];
        envVars[key] = val ? `${'•'.repeat(Math.min(val.length, 20))} (${val.length} chars)` : '(not set)';
      } else {
        envVars[key] = process.env[key];
      }
    });

    // Filter to show only relevant vars
    const relevantPrefixes = ['NODE_', 'MONGO', 'JWT', 'STRIPE', 'CLOUD', 'PORT', 'VITE', 'npm_'];
    const filteredEnv = {};
    Object.entries(envVars).forEach(([k, v]) => {
      if (relevantPrefixes.some(p => k.toUpperCase().startsWith(p)) || k === 'PORT') {
        filteredEnv[k] = v;
      }
    });

    // Runtime info
    const runtime = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memoryUsage: {
        rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (process.memoryUsage().external / 1024 / 1024).toFixed(2) + ' MB'
      },
      uptime: (process.uptime() / 3600).toFixed(2) + ' hours',
      cwd: process.cwd()
    };

    sendSuccess(res, 200, 'Environment Audit', { environment: filteredEnv, runtime });
  } catch (error) {
    next(error);
  }
};

// ─── DEPENDENCY AUDIT ────────────────────────────────────

/**
 * @desc    Get package dependencies and vulnerability scan
 * @route   GET /api/v1/admin/security/dependencies
 * @access  Private/Admin
 */
export const getDependencies = async (req, res, next) => {
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    const dependencies = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
      name, version, type: 'production'
    }));

    const devDependencies = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
      name, version, type: 'development'
    }));

    // Run npm audit (capture output, never crash)
    let auditResult = { vulnerabilities: {}, metadata: {} };
    try {
      const auditOutput = execSync('npm audit --json 2>/dev/null', {
        cwd: path.join(__dirname, '..'),
        timeout: 15000,
        encoding: 'utf-8'
      });
      auditResult = JSON.parse(auditOutput);
    } catch (e) {
      // npm audit exits with non-zero if vulnerabilities found
      try {
        if (e.stdout) auditResult = JSON.parse(e.stdout);
      } catch {
        // Fallback: no audit data
      }
    }

    const vulnSummary = auditResult.metadata?.vulnerabilities || {};

    sendSuccess(res, 200, 'Dependency Audit', {
      name: pkg.name,
      version: pkg.version,
      dependencies,
      devDependencies,
      totalDeps: dependencies.length + devDependencies.length,
      vulnerabilities: vulnSummary,
      hasVulnerabilities: Object.values(vulnSummary).some(v => v > 0)
    });
  } catch (error) {
    next(error);
  }
};

// ─── CRON / SCHEDULED TASKS ──────────────────────────────

// In-memory task registry
const registeredTasks = [
  {
    id: 'session_cleanup',
    name: 'Session Cleanup',
    description: 'Removes expired active sessions from the database',
    schedule: 'Every 1 hour',
    lastRun: null,
    nextRun: null,
    status: 'active',
    runs: 0,
    errors: 0
  },
  {
    id: 'failed_login_cleanup',
    name: 'Failed Login Purge',
    description: 'Clears failed login attempts older than 7 days (TTL index)',
    schedule: 'Automatic (MongoDB TTL)',
    lastRun: null,
    nextRun: null,
    status: 'active',
    runs: 0,
    errors: 0
  },
  {
    id: 'log_rotation',
    name: 'Log Rotation',
    description: 'Rotates and compresses server log files (Winston DailyRotateFile)',
    schedule: 'Daily at midnight',
    lastRun: null,
    nextRun: null,
    status: 'active',
    runs: 0,
    errors: 0
  },
  {
    id: 'config_cache_refresh',
    name: 'Config Cache Refresh',
    description: 'Refreshes the in-memory platform configuration cache from database',
    schedule: 'Every 30 seconds',
    lastRun: new Date(),
    nextRun: new Date(Date.now() + 30000),
    status: 'active',
    runs: 0,
    errors: 0
  },
  {
    id: 'rate_limit_window_reset',
    name: 'Rate Limit Window Reset',
    description: 'Express rate limiter resets IP counters every 10 minutes',
    schedule: 'Every 10 minutes',
    lastRun: null,
    nextRun: null,
    status: 'active',
    runs: 0,
    errors: 0
  }
];

// Actually run the session cleanup every hour
setInterval(async () => {
  try {
    const task = registeredTasks.find(t => t.id === 'session_cleanup');
    const result = await ActiveSession.deleteMany({
      lastActivity: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    if (task) {
      task.lastRun = new Date();
      task.nextRun = new Date(Date.now() + 60 * 60 * 1000);
      task.runs++;
    }
  } catch (e) {
    const task = registeredTasks.find(t => t.id === 'session_cleanup');
    if (task) task.errors++;
  }
}, 60 * 60 * 1000);

/**
 * @desc    Get scheduled tasks status
 * @route   GET /api/v1/admin/security/cron
 * @access  Private/Admin
 */
export const getCronJobs = async (req, res, next) => {
  try {
    sendSuccess(res, 200, 'Scheduled Tasks', {
      tasks: registeredTasks,
      total: registeredTasks.length,
      active: registeredTasks.filter(t => t.status === 'active').length
    });
  } catch (error) {
    next(error);
  }
};
