const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/", categoryController.getCategories);
router.post("/", verifyToken, checkRole(["admin"]), categoryController.addCategories);

module.exports = router;
