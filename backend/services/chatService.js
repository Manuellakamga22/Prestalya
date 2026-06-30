const chatRepo = require("../repositories/chatRepository");
const userRepo = require("../repositories/userRepository");

const getOrCreateConversation = async (clientId, providerId, bookingId) => {
  return chatRepo.findOrCreateConversation(clientId, providerId, bookingId);
};

const getMyConversations = async (userId) => {
  const convs = await chatRepo.getConversationsByUser(userId);
  return Promise.all(convs.map(async (c) => {
    const otherId = c.clientId === userId ? c.providerId : c.clientId;
    const other = await userRepo.findById(otherId).catch(() => null);
    const unreadCount = await chatRepo.countUnread(c._id.toString(), userId).catch(() => 0);
    return {
      _id:         c._id,
      clientId:    c.clientId,
      providerId:  c.providerId,
      bookingId:   c.bookingId,
      lastMessage: c.lastMessage || "",
      lastAt:      c.lastAt,
      other_name:  other ? `${other.prenom} ${other.nom}` : "Utilisateur",
      other_photo: other?.photo_url || null,
      unread:      unreadCount,
    };
  }));
};

const getMessages = async (convId, userId, limit, before) => {
  const conv = await chatRepo.findConversationById(convId);
  if (!conv) throw Object.assign(new Error("Conversation introuvable."), { status: 404 });
  if (conv.clientId !== userId && conv.providerId !== userId)
    throw Object.assign(new Error("Non autorisé."), { status: 403 });
  await chatRepo.markRead(convId, userId);
  return chatRepo.getMessages(convId, limit || 50, before);
};

const sendMessage = async (convId, senderId, content, type, meta) => {
  const conv = await chatRepo.findConversationById(convId);
  if (!conv) throw Object.assign(new Error("Conversation introuvable."), { status: 404 });
  if (conv.clientId !== senderId && conv.providerId !== senderId)
    throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (!content || !content.trim()) throw Object.assign(new Error("Message vide."), { status: 400 });
  const user = await userRepo.findById(senderId);
  const senderName = user ? `${user.prenom} ${user.nom}` : "";
  return chatRepo.addMessage(convId, senderId, senderName, content.trim(), type, meta);
};

module.exports = { getOrCreateConversation, getMyConversations, getMessages, sendMessage };
