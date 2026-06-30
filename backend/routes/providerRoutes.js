const router = require("express").Router();
const ctrl = require("../controllers/providerController");
const auth = require("../middleware/auth");

router.get("/",           ctrl.list);
router.get("/:id",        ctrl.getOne);
router.post("/",     auth, ctrl.createProfile);
router.put("/:id",   auth, ctrl.updateProfile);

module.exports = router;
