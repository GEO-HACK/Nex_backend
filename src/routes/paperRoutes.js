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
	(req, res, next) => {
		console.log("Request reached multer, before upload");
		console.log("Body: ", req.body);
		console.log("Files: ", req.files);
		next();
	},
	checkRole(["admin", "author"]),
	(req, res) => {
		upload.single("file")(req, res, (err) => {
			if (err) {
				console.error("Multer Error: ", err);
				return res.status(400).json({ error: "File upload failed", details: err.message });
			}
			console.log("Multer Executed");
			console.log("received file: ", req.file);

			if (!req.file) {
				return res.status(400).json({ error: "No file uploaded" });
			}

			res.status(200).json({ message: "Upload successful" });
		});
	},
	paperController.uploadPaper
); // Upload paper

//TODO: Check if all required fields are filled before accepting upload
router.post("/local", verifyToken, ensurePathExists("../uploads"), localstore.single("file"), paperController.localUploadPaper); //upload paper locally
router.get("", paperController.getPapers);
router.get("/:id", paperController.getPaperById);


//? Chenge to this to ensure paper ownship. you could test it out :)
// router.put("/", verifyToken, checkRole(["author", "admin"]), checkPaperAccess("edit"), paperController.updateLocalPaper);
// router.delete("/:id", verifyToken, checkRole(["admin", "author"]), checkPaperAccess("delete"), paperController.deletePaper);
router.put("/", verifyToken, checkRole(["author", "admin"]), paperController.updateLocalPaper);
router.delete("/:id", verifyToken, checkRole(["admin", "author"]), paperController.deletePaper);


//get papers according to user id
router.get("/user", verifyToken, paperController.getUserPapers);
module.exports = router;
