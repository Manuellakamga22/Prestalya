const router = require("express").Router();
const ctrl = require("../controllers/chatController");
const auth = require("../middleware/auth");

router.post("/",              auth, ctrl.startConversation);
router.get("/",               auth, ctrl.myConversations);
router.get("/:id/messages",   auth, ctrl.getMessages);
router.post("/:id/messages",  auth, ctrl.sendMessage);

module.exports = router;
