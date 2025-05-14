const { getPaperObjectById } = require("../models/paperModel");
const db = require("../config/dbConfig");

const checkPaperAccess = (mode = "edit") => {
	return (req, res, next) => {
		const user = req.user;
		const paperId = Number(req.params.id || req.body.paper_id || req.body.id);

		if (!paperId || isNaN(paperId)) {
			return res.status(400).json({ message: "Invalid or missing paper_id" });
		}

		const paper = getPaperObjectById(paperId);
		if (!paper) {
			return res.status(404).json({ message: "Paper not found" });
		}
		const isAdmin = user.role.toLowerCase() === "admin";
		const isOwner = user.id === paper.publisher_id;
		const isCoauthor = db.prepare("SELECT 1 FROM author_papers WHERE rauthor_id = ? AND rpaper_id = ?").get(user.id, paperId);

		if (isAdmin) return next();

		if (mode === "delete") {
			if (!isOwner) {
				return res.status(403).json({ message: "Only the author can delete this paper" });
			}
		} else {
			if (!isOwner && !isCoauthor) {
				return res.status(403).json({ message: "You are not associated with this paper" });
			}
		}

		req.paper = paper;
		next();
	};
};

module.exports = { checkPaperAccess };
