const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ["new_booking","booking_confirmed","booking_cancelled","booking_terminated","new_message","new_review"],
    required: true,
  },
  title: { type: String, required: true },
  body:  { type: String, required: true },
  link:  { type: String, default: null },
  read:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", schema);
