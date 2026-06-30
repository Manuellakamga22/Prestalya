const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId:       { type: String, required: true },
    senderName:     { type: String, default: "" },
    content:        { type: String, required: true, maxlength: 2000 },
    read:           { type: Boolean, default: false },
    type:           { type: String, enum: ["text", "image", "file"], default: "text" },
    meta:           { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
