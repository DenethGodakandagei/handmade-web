import express from "express";
import {
  startChat,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  getMyChats
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyChats);
router.post("/start", protect, startChat);
router.post("/message", protect, sendMessage);
router.get("/:chatId/messages", protect, getMessages);
router.put("/message/:messageId", protect, editMessage);
router.delete("/message/:messageId", protect, deleteMessage);

export default router;