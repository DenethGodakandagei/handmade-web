import Chat from "../models/ChatModel.js";
import Message from "../models/MessageModel.js";

export const startChatService = async (customerId, artisanId, productId) => {
  let chat = await Chat.findOne({
    customer: customerId,
    artisan: artisanId,
    product: productId
  });

  if (!chat) {
    chat = await Chat.create({
      customer: customerId,
      artisan: artisanId,
      product: productId
    });
  }

  return chat;
};

export const sendMessageService = async (chatId, senderId, content) => {
  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    content: content
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: content
  });

  return message;
};

export const getMessagesService = async (chatId) => {
  return Message.find({ chat: chatId })
    .populate("sender", "name role")
    .sort({ createdAt: 1 });
};

export const editMessageService = async (messageId, userId, newContent) => {
  const message = await Message.findOne({
    _id: messageId,
    sender: userId
  });

  if (!message) throw new Error("Message not found or unauthorized");

  message.content = newContent;
  message.isEdited = true;
  await message.save();

  return message;
};

export const deleteMessageService = async (messageId, userId) => {
  const message = await Message.findOne({
    _id: messageId,
    sender: userId
  });

  if (!message) throw new Error("Message not found or unauthorized");

  await message.deleteOne();
};