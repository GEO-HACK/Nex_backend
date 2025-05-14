const express = require("express");
const router = express.Router();
const devController = require("../controllers/devController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const { ensurePathExists } = require("../middleware/pathMiddleware");

router.delete("/tables", ensurePathExists("../backups"), verifyToken, checkRole(["admin"]), devController.resetTables);
router.delete("/table", verifyToken, checkRole(["admin"]), devController.resetTable);
router.get("/restore", verifyToken, checkRole(["admin"]), devController.restoreTables);
router.get("/readtable", verifyToken, checkRole(["admin"]), devController.readTable);

module.exports = router