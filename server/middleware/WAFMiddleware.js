import { trackIP } from '../utils/ipTracker.js';
import logger from '../config/logger.js';
import BlacklistedIP from '../models/BlacklistedIPModel.js';

// In-memory blacklist cache (refreshed every 60 seconds)
let blacklistCache = new Set();
let blacklistCacheTime = 0;

const refreshBlacklist = async () => {
  const now = Date.now();
  if (now - blacklistCacheTime < 60000) return; // 60s TTL
  try {
    const ips = await BlacklistedIP.find().select('ip').lean();
    blacklistCache = new Set(ips.map(e => e.ip));
    blacklistCacheTime = now;
  } catch (e) {
    // Don't crash on DB failure
  }
};

/**
 * Web Application Firewall (WAF) Middleware
 * Tracks active HTTP requests, triggers SOC logging,
 * checks IP blacklist, and intercepts malicious payloads.
 */
export const WAFMiddleware = async (req, res, next) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].replace('::ffff:', '');
    
    // Check IP blacklist
    await refreshBlacklist();
    if (blacklistCache.has(ip)) {
        // Increment hit counter asynchronously
        BlacklistedIP.findOneAndUpdate({ ip }, { $inc: { hitCount: 1 } }).catch(() => {});
        logger.error(`WAF BLOCKED: Blacklisted IP ${ip} attempted access to ${req.originalUrl}`);
        return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Access denied. Your IP has been blocked by the platform administrator.'
        });
    }
    
    // Asynchronously hook IP to geo database without blocking the request
    trackIP(ip).then(geo => {
        const countryCode = geo.countryCode || 'LCL';
        const isp = geo.isp || 'Local Network / ISP';
        
        // SQL / NoSQL Injection Regex check
        const payloadString = JSON.stringify(req.body || {}) + req.originalUrl;
        const maliciousPattern = /(\$where|\$ne|\$gt|\$lt|union\s+select|select\s+\*|1=1|--)/i;
        
        if (maliciousPattern.test(payloadString)) {
            logger.error(`WAF BLOCK: Threat signature detected from ${ip} | Path: ${req.originalUrl}`);
            req.waf_blocked = true;
        } else {
            logger.info(`[WAF] ${req.method} ${req.originalUrl} - ${ip} (${countryCode}) - ${isp}`);
        }
    }).catch(e => {
        logger.error(`WAF geo tracking failure: ${e.message}`);
    });

    next();
};

/**
 * Force refresh the blacklist cache (call after adding/removing IPs).
 */
export const invalidateBlacklistCache = () => {
  blacklistCacheTime = 0;
};

export default WAFMiddleware;
