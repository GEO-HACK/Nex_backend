const express = require("express");
router = express.Router();
const tagsController = require("../controllers/tagController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/", tagsController.getTags);
router.post("/", verifyToken, checkRole(["admin"]), tagsController.addTags);
router.post("/single", verifyToken, checkRole(["admin"]), tagsController.addTag);

module.exports = router;
