import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './logger.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    logger.info(`Socket Connected: ${socket.user.id}`);

    // Join user-specific room
    socket.join(`user_${socket.user.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket Disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
