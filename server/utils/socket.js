// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import logger from './logger.js';

// let io;

// export const initSocket = (httpServer) => {
//   io = new Server(httpServer, {
//     cors: {
//       origin: process.env.CLIENT_URL || 'http://localhost:5173',
//       methods: ['GET', 'POST'],
//       credentials: true
//     }
//   });

//   // Middleware for authentication
//   io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       return next(new Error('Authentication error'));
//     }
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) return next(new Error('Authentication error'));
//       socket.user = decoded;
//       next();
//     });
//   });

//   io.on('connection', (socket) => {
//     logger.info(`Socket Connected: ${socket.user.id}`);

//     // Join user-specific room
//     socket.join(`user_${socket.user.id}`);

//     socket.on('disconnect', () => {
//       logger.info(`Socket Disconnected: ${socket.user.id}`);
//     });
//   });

//   return io;
// };

// export const getIO = () => {
//   if (!io) {
//     throw new Error('Socket.io not initialized!');
//   }
//   return io;
// };


import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "./logger.js";


// Store online users
// { userId: socketId }
const userSocketMap = {};

/**
 * Initialize Socket.IO
 * 
 */
let io; // ✅ FIX: declare io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /**
   * Socket Authentication Middleware (JWT)
   */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // attach user data to socket
        socket.user = decoded;
        socket.userId = decoded.id;

        next();
      });
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  /**
   * Socket Connection
   */
  io.on("connection", (socket) => {
    const userId = socket.userId;

    logger.info(`Socket Connected: User ID ${userId}`);

    // Store online user
    userSocketMap[userId] = socket.id;

    // Join personal room
    socket.join(`user_${userId}`);

    // Emit online users list to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    /**
     * Disconnect Event
     */
    socket.on("disconnect", () => {
      logger.info(`Socket Disconnected: User ID ${userId}`);

      delete userSocketMap[userId];

      // Update online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Get receiver socket ID (used for private messaging)
 */
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};
