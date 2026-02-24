import axios from 'axios';

// Cache to prevent pounding the geo API
const geoCache = new Map();

/**
 * Enhanced IP tracking utility for security logging
 * @param {string} ip - IP address to track
 * @returns {object} Geo details
 */
export const trackIP = async (ip) => {
    // Handle localhost/docker IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return {
            status: 'success',
            country: 'Local Network',
            countryCode: 'LCL',
            regionName: 'Loopback',
            city: 'Development',
            isp: 'Internal Routing',
            query: ip
        };
    }

    // Check cache
    if (geoCache.has(ip)) {
        return geoCache.get(ip);
    }

    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const data = response.data;
        
        // Only cache successful external IPs to save memory
        if (data.status === 'success') {
            geoCache.set(ip, data);
            
            // Clean cache if too large (prevent memory leak)
            if(geoCache.size > 5000) {
                const firstKey = geoCache.keys().next().value;
                geoCache.delete(firstKey);
            }
        }
        return data;
    } catch (error) {
        console.error('Geo IP mapping failed for', ip, error.message);
        return { status: 'fail', message: 'Tracking failed', query: ip };
    }
};
