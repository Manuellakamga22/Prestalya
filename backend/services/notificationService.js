const notifRepo = require("../repositories/notificationRepository");
const { getIo } = require("../config/ioInstance");

const ICONS = {
  new_booking:           "📋",
  booking_confirmed:     "✅",
  booking_cancelled:     "❌",
  booking_terminated:    "🎉",
  new_message:           "💬",
  new_review:            "⭐",
};

async function push(userId, { type, title, body, link = null }) {
  const notif = await notifRepo.create({ userId, type, title, body, link });
  const io = getIo();
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", {
      _id:       notif._id,
      type,
      title,
      body,
      link,
      read:      false,
      icon:      ICONS[type] || "🔔",
      createdAt: notif.createdAt,
    });
  }
  return notif;
}

module.exports = { push, ICONS };
