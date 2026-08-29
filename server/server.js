import { createServer } from 'http';
import { initSocket } from './utils/socket.js';
import app from './app.js';
import { ENV } from './utils/env.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);



const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Connect to database
connectDB();

const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
