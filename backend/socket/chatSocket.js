const jwt = require("jsonwebtoken");
const chatRepo = require("../repositories/chatRepository");
const userRepo = require("../repositories/userRepository");
const notifService = require("../services/notificationService");

module.exports = function initSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token manquant."));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Token invalide."));
    }
  });

  io.on("connection", (socket) => {
    // join personal room for notifications
    socket.join(`user_${socket.user.id}`);

    socket.on("join_conversation", (convId) => {
      socket.join(`conv_${convId}`);
    });

    socket.on("leave_conversation", (convId) => {
      socket.leave(`conv_${convId}`);
    });

    socket.on("send_message", async ({ convId, content, type = "text", meta = {} }) => {
      try {
        const conv = await chatRepo.findConversationById(convId);
        if (!conv) return;
        const senderId = socket.user.id;
        if (conv.clientId !== senderId && conv.providerId !== senderId) return;
        if (!content || !content.trim()) return;

        const user = await userRepo.findById(senderId);
        const senderName = user ? `${user.prenom} ${user.nom}` : "";

        const message = await chatRepo.addMessage(convId, senderId, senderName, content.trim(), type, meta);
        io.to(`conv_${convId}`).emit("new_message", message);

        // notify the OTHER participant
        const recipientId = conv.clientId === senderId ? conv.providerId : conv.clientId;
        notifService.push(recipientId, {
          type:  "new_message",
          title: "Nouveau message",
          body:  `${senderName} : ${content.trim().slice(0, 60)}${content.trim().length > 60 ? "…" : ""}`,
          link:  `/chat/${convId}`,
        }).catch(() => {});
      } catch {
        socket.emit("chat_error", { message: "Erreur envoi message." });
      }
    });

    socket.on("mark_read", async (convId) => {
      await chatRepo.markRead(convId, socket.user.id).catch(() => {});
      socket.to(`conv_${convId}`).emit("messages_read", { convId, userId: socket.user.id });
    });

    socket.on("typing", ({ convId }) => {
      socket.to(`conv_${convId}`).emit("user_typing", { userId: socket.user.id, convId });
    });

    socket.on("stop_typing", ({ convId }) => {
      socket.to(`conv_${convId}`).emit("user_stop_typing", { userId: socket.user.id, convId });
    });
  });
};
