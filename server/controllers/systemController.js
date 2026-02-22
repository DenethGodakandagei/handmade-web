import os from 'os';
import mongoose from 'mongoose';
import axios from 'axios';
import { sendSuccess } from '../utils/responseUtils.js';

export const getMetrics = async (req, res, next) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = ((usedMem / totalMem) * 100).toFixed(2);

    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const cpuModel = cpus[0].model;
    
    // Calculate simple active load over tick
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + (1 - idle / total);
    }, 0) / cpuCount;
    const cpuPercentage = (cpuUsage * 100).toFixed(2);

    const uptime = os.uptime();
    const platform = os.platform();
    const loadavg = os.loadavg(); 

    // Get real DB stats
    const dbStats = await mongoose.connection.db.stats();
    
    sendSuccess(res, 200, 'System Metrics', {
      memory: {
        total: (totalMem / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        used: (usedMem / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        free: (freeMem / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        percentage: Number(memPercentage)
      },
      cpu: {
        model: cpuModel,
        cores: cpuCount,
        percentage: Number(cpuPercentage),
        load: loadavg
      },
      os: {
        platform,
        uptime: (uptime / 3600).toFixed(2) + ' hours',
        architecture: os.arch()
      },
      database: {
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: (dbStats.dataSize / (1024 * 1024)).toFixed(2) + ' MB',
        storageSize: (dbStats.storageSize / (1024 * 1024)).toFixed(2) + ' MB',
        indexes: dbStats.indexes,
        indexSize: (dbStats.indexSize / (1024 * 1024)).toFixed(2) + ' MB'
      }
    });
  } catch (error) {
    next(error);
  }
};

let cachedNodes = null;

export const getNodes = async (req, res, next) => {
  try {
    if (cachedNodes) {
        return sendSuccess(res, 200, 'Global Nodes Diagram', cachedNodes);
    }
    
    const nodes = [];

    // 1. Fetch REAL IP and location data for the Application Runtime
    try {
        const response = await axios.get('http://ip-api.com/json/');
        const geo = response.data;
        if (geo && geo.status === 'success') {
            nodes.push({ 
                id: 'core-1', 
                name: `Primary Core Runtime`, 
                coordinates: [geo.lon, geo.lat], 
                status: 'operational', 
                type: 'Process VM', 
                ip: geo.query,
                details: {
                    city: geo.city,
                    region: geo.regionName,
                    country: geo.countryCode,
                    isp: geo.isp,
                    asn: geo.as,
                    timezone: geo.timezone
                }
            });
        }
    } catch (e) {
        console.error("Failed Main Server Geo:", e);
    }
    
    // 2. Fetch REAL IP and location data for the Database Cluster
    try {
        const dbHost = mongoose.connection.host;
        if (dbHost) {
            const dns = await import('dns');
            const { address } = await dns.promises.lookup(dbHost);
            const dbIpRes = await axios.get(`http://ip-api.com/json/${address}`);
            const dbGeo = dbIpRes.data;
            if (dbGeo && dbGeo.status === 'success') {
                nodes.push({ 
                    id: 'db-1', 
                    name: `Storage Cluster`, 
                    coordinates: [dbGeo.lon, dbGeo.lat], 
                    status: 'operational', 
                    type: 'MongoDB Atlas', 
                    ip: address,
                    details: {
                        city: dbGeo.city,
                        region: dbGeo.regionName,
                        country: dbGeo.countryCode,
                        isp: dbGeo.isp,
                        asn: dbGeo.as,
                        timezone: dbGeo.timezone
                    }
                });
            }
        }
    } catch (dbErr) {
        console.error("Failed Database Geo:", dbErr);
    }

    cachedNodes = nodes;
    sendSuccess(res, 200, 'Global Nodes Diagram', nodes);
  } catch (error) {
    next(error);
  }
};
