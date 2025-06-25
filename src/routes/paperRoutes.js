const express = require("express");
const router = express.Router();
const paperController = require("../controllers/paperController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const { ensurePathExists } = require("../middleware/pathMiddleware");
const { upload, localstore } = require("../config/multerConfig");
// const multer = require("multer");

router.post(
  "/",
  verifyToken,   
  upload.single("file"), // "file" is the field name for the uploaded file
  paperController.createPaper
);

//TODO: Check if all required fields are filled before accepting upload
router.post("/local", verifyToken, ensurePathExists("../uploads"), localstore.single("file"), paperController.createPaper); //upload paper locally
router.get("", paperController.getPapers);

router.get("/my-papers",verifyToken, paperController.getUserPapers);
 
router.get("/:id", paperController.getPaperById);


//? Chenge to this to ensure paper ownship. you could test it out :)
// router.put("/", verifyToken, checkRole(["author", "admin"]), checkPaperAccess("edit"), paperController.updateLocalPaper);
// router.delete("/:id", verifyToken, checkRole(["admin", "author"]), checkPaperAccess("delete"), paperController.deletePaper);
router.put("/", verifyToken, checkRole(["author", "admin"]), paperController.updateLocalPaper);

router.delete("/:id", verifyToken, checkRole(["admin", "author"]), paperController.deletePaper);


module.exports = router;
