const Notification = require("../models/Notification");

const create = (data) => Notification.create(data);

const findByUser = (userId) =>
  Notification.find({ userId }).sort({ createdAt: -1 }).limit(30).lean();

const countUnread = (userId) =>
  Notification.countDocuments({ userId, read: false });

const markRead = (id, userId) =>
  Notification.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });

const markAllRead = (userId) =>
  Notification.updateMany({ userId, read: false }, { read: true });

const deleteOne = (id, userId) =>
  Notification.findOneAndDelete({ _id: id, userId });

module.exports = { create, findByUser, countUnread, markRead, markAllRead, deleteOne };
