/**
 * In-memory traffic telemetry engine.
 * Tracks request counts per second, per endpoint, per method, and per IP.
 * Uses a ring buffer for the last 60 seconds of data.
 */

const WINDOW_SIZE = 60; // 60-second sliding window

// Ring buffer: each slot = 1 second of data
let ringBuffer = Array.from({ length: WINDOW_SIZE }, () => ({
  timestamp: 0,
  total: 0,
  methods: {},
  endpoints: {},
  ips: {},
  statusCodes: {}
}));

let currentSlot = 0;
let totalRequests = 0;
let startTime = Date.now();

// Rate limit tracking
const rateLimitHits = new Map(); // ip -> { count, lastHit }

/**
 * Express middleware to track every request.
 */
export const trafficTracker = (req, res, next) => {
  const now = Math.floor(Date.now() / 1000);
  const slotIndex = now % WINDOW_SIZE;
  const slot = ringBuffer[slotIndex];

  // Reset slot if it's from a different second
  if (slot.timestamp !== now) {
    slot.timestamp = now;
    slot.total = 0;
    slot.methods = {};
    slot.endpoints = {};
    slot.ips = {};
    slot.statusCodes = {};
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';
  const ip = rawIp.split(',')[0].replace('::ffff:', '');
  const endpoint = req.originalUrl.split('?')[0]; // Strip query params
  const method = req.method;

  slot.total++;
  slot.methods[method] = (slot.methods[method] || 0) + 1;
  slot.endpoints[endpoint] = (slot.endpoints[endpoint] || 0) + 1;
  slot.ips[ip] = (slot.ips[ip] || 0) + 1;
  totalRequests++;

  // Track response status code
  const originalEnd = res.end;
  res.end = function (...args) {
    const code = String(res.statusCode);
    slot.statusCodes[code] = (slot.statusCodes[code] || 0) + 1;

    // Track rate limit hits (429 = Too Many Requests)
    if (res.statusCode === 429) {
      const existing = rateLimitHits.get(ip) || { count: 0, lastHit: 0 };
      existing.count++;
      existing.lastHit = Date.now();
      rateLimitHits.set(ip, existing);
    }

    originalEnd.apply(res, args);
  };

  next();
};

/**
 * Get the traffic snapshot for the dashboard.
 */
export const getTrafficSnapshot = () => {
  const now = Math.floor(Date.now() / 1000);
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  // Aggregate last 60 seconds
  let recentTotal = 0;
  const methodTotals = {};
  const endpointTotals = {};
  const ipTotals = {};
  const statusTotals = {};
  const perSecond = [];

  for (let i = 0; i < WINDOW_SIZE; i++) {
    const slot = ringBuffer[i];
    const age = now - slot.timestamp;

    if (age < WINDOW_SIZE && slot.timestamp > 0) {
      recentTotal += slot.total;
      perSecond.push({ second: slot.timestamp, count: slot.total });

      for (const [m, c] of Object.entries(slot.methods)) {
        methodTotals[m] = (methodTotals[m] || 0) + c;
      }
      for (const [e, c] of Object.entries(slot.endpoints)) {
        endpointTotals[e] = (endpointTotals[e] || 0) + c;
      }
      for (const [ip, c] of Object.entries(slot.ips)) {
        ipTotals[ip] = (ipTotals[ip] || 0) + c;
      }
      for (const [s, c] of Object.entries(slot.statusCodes)) {
        statusTotals[s] = (statusTotals[s] || 0) + c;
      }
    }
  }

  // Sort endpoints and IPs by frequency
  const topEndpoints = Object.entries(endpointTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([endpoint, count]) => ({ endpoint, count }));

  const topIPs = Object.entries(ipTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([ip, count]) => ({ ip, count }));

  // Rate limit offenders
  const rateLimitOffenders = [];
  for (const [ip, data] of rateLimitHits.entries()) {
    rateLimitOffenders.push({ ip, ...data });
  }
  rateLimitOffenders.sort((a, b) => b.count - a.count);

  const rps = recentTotal > 0 ? (recentTotal / Math.min(WINDOW_SIZE, uptimeSeconds || 1)).toFixed(2) : '0.00';

  return {
    live: {
      requestsPerSecond: Number(rps),
      requestsLast60s: recentTotal,
      totalSinceStart: totalRequests,
      uptimeSeconds
    },
    methods: methodTotals,
    statusCodes: statusTotals,
    topEndpoints,
    topIPs,
    rateLimitOffenders: rateLimitOffenders.slice(0, 20),
    perSecond: perSecond.sort((a, b) => a.second - b.second)
  };
};
