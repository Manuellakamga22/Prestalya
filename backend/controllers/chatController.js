const chatService = require("../services/chatService");

const startConversation = async (req, res, next) => {
  try {
    const { provider_id, booking_id } = req.body;
    const conv = await chatService.getOrCreateConversation(req.user.id, provider_id, booking_id);
    res.status(201).json(conv);
  } catch (err) { next(err); }
};

const myConversations = async (req, res, next) => {
  try {
    const convs = await chatService.getMyConversations(req.user.id);
    res.json(convs);
  } catch (err) { next(err); }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(req.params.id, req.user.id);
    res.json(messages);
  } catch (err) { next(err); }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.params.id, req.user.id, req.body.content);
    res.status(201).json(message);
  } catch (err) { next(err); }
};

module.exports = { startConversation, myConversations, getMessages, sendMessage };
