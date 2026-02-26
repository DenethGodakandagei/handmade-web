import asyncHandler from "../middleware/asyncHandler.js";
import {
  startChatService,
  sendMessageService,
  getMessagesService,
  editMessageService,
  deleteMessageService,
  getMyChatsService
} from "../services/chatService.js";

/**
 * @desc Get all chats for the current user
 */
export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await getMyChatsService(req.user.id);
  res.status(200).json({ success: true, data: chats });
});

/**
 * @desc Start or get chat
 */
export const startChat = asyncHandler(async (req, res) => {
  const { artisanId, productId } = req.body;

  const chat = await startChatService(
    req.user.id,
    artisanId,
    productId
  );

  res.status(200).json({ success: true, data: chat });
});

/**
 * @desc Send message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  const message = await sendMessageService(
    chatId,
    req.user.id,
    content
  );

  res.status(201).json({ success: true, data: message });
});

/**
 * @desc Get chat messages
 */
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await getMessagesService(req.params.chatId);
  res.status(200).json({ success: true, data: messages });
});

/**
 * @desc Edit message
 */
export const editMessage = asyncHandler(async (req, res) => {
  const message = await editMessageService(
    req.params.messageId,
    req.user.id,
    req.body.content
  );

  res.status(200).json({ success: true, data: message });
});

/**
 * @desc Delete message
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  await deleteMessageService(req.params.messageId, req.user.id);
  res.status(200).json({ success: true, message: "Message deleted" });
});