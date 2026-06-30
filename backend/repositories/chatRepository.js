const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const findOrCreateConversation = async (clientId, providerId, bookingId = null) => {
  let conv = await Conversation.findOne({ clientId, providerId });
  if (conv) return conv;
  conv = await Conversation.create({ clientId, providerId, bookingId });
  return conv;
};

const getConversationsByUser = async (userId) => {
  return Conversation.find({
    $or: [{ clientId: userId }, { providerId: userId }],
  }).sort({ lastAt: -1 });
};

const findConversationById = async (id) => {
  return Conversation.findById(id);
};

const getMessages = async (conversationId, limit = 50, before = null) => {
  const filter = { conversationId };
  if (before) filter.createdAt = { $lt: new Date(before) };
  return Message.find(filter).sort({ createdAt: 1 }).limit(limit);
};

const addMessage = async (conversationId, senderId, senderName, content, type = "text", meta = {}) => {
  const msg = await Message.create({ conversationId, senderId, senderName, content, type, meta });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content.length > 80 ? content.slice(0, 80) + "…" : content,
    lastAt: msg.createdAt,
  });

  return msg;
};

const markRead = async (conversationId, userId) => {
  await Message.updateMany(
    { conversationId, senderId: { $ne: userId }, read: false },
    { $set: { read: true } }
  );
};

const countUnread = async (conversationId, userId) => {
  return Message.countDocuments({ conversationId, senderId: { $ne: userId }, read: false });
};

module.exports = {
  findOrCreateConversation,
  getConversationsByUser,
  findConversationById,
  getMessages,
  addMessage,
  markRead,
  countUnread,
};
