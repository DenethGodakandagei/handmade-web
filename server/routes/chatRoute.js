import express from "express";
import {
  startChat,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  getMyChats,
  deleteChat
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time chat functionality
 */

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all chats for the logged-in user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 */
router.get("/", protect, getMyChats);
/**
 * @swagger
 * /chat/start:
 *   post:
 *     summary: Start a new chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artisanId:
 *                 type: string
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat started or retrieved
 */
router.post("/start", protect, startChat);

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post("/message", protect, sendMessage);
/**
 * @swagger
 * /chat/{chatId}/messages:
 *   get:
 *     summary: Get all messages for a specific chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/:chatId/messages", protect, getMessages);

/**
 * @swagger
 * /chat/message/{messageId}:
 *   put:
 *     summary: Edit a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated
 *   delete:
 *     summary: Delete a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.put("/message/:messageId", protect, editMessage);
router.delete("/message/:messageId", protect, deleteMessage);
router.delete("/:chatId", protect, deleteChat);

export default router;