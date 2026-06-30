const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    clientId:   { type: String, required: true },
    providerId: { type: String, required: true },
    bookingId:  { type: String, default: null },
    lastMessage: { type: String, default: "" },
    lastAt:     { type: Date, default: null },
    unreadClient:   { type: Number, default: 0 },
    unreadProvider: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ clientId: 1, providerId: 1 }, { unique: true });
conversationSchema.index({ clientId: 1 });
conversationSchema.index({ providerId: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
