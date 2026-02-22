import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSuccess, ErrorResponse } from '../utils/responseUtils.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../../logs');

export const getSystemLogs = async (req, res, next) => {
  try {
    // Find the most recent combined log
    if (!fs.existsSync(logDir)) {
       return sendSuccess(res, 200, 'Audit Logs', []);
    }
    
    const files = fs.readdirSync(logDir).filter(f => f.startsWith('combined-') && f.endsWith('.log'));
    if (files.length === 0) {
        return sendSuccess(res, 200, 'Audit Logs', []);
    }
    
    // Sort to get newest first
    files.sort((a, b) => {
        return fs.statSync(path.join(logDir, b)).mtime.getTime() - fs.statSync(path.join(logDir, a)).mtime.getTime();
    });
    
    const recentLogFile = path.join(logDir, files[0]);
    const logContent = fs.readFileSync(recentLogFile, 'utf-8');
    
    // Parse JSON lines
    const logs = logContent.split('\n')
        .filter(line => line.trim())
        .map(line => {
            try {
                return JSON.parse(line);
            } catch (e) {
                return null;
            }
        })
        .filter(bool => bool)
        .reverse()
        .slice(0, 500); // Send the latest 500 logs for the dashboard
        
    sendSuccess(res, 200, 'Audit Logs', logs);
  } catch (error) {
    next(error);
  }
};
