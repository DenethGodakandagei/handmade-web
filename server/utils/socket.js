import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import logger from "../utils/logger.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  /**
   * 🔐 Socket Authentication Middleware
   */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user; // 👈 attach authenticated user
      next();
    } catch (err) {
      logger.error("Socket auth failed", err);
      next(new Error("Authentication error"));
    }
  });

  /**
   * 🔌 Socket Events
   */
  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.user.id}`);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", (data) => {
      const messagePayload = {
        ...data,
        sender: socket.user.id,
        createdAt: new Date()
      };

      io.to(data.chatId).emit("receiveMessage", messagePayload);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};