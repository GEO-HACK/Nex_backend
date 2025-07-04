const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/user", verifyToken, userController.getUser);
router.get("/authors", verifyToken, userController.filterAuthors);
router.get("/users", verifyToken, userController.getAllUsers);

module.exports = router;
