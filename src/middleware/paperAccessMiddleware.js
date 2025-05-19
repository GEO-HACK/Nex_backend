const { getPaperObjectById } = require("../models/paperModel");
const { pool, sql } = require("../config/dbConfig"); // your mssql config

const checkPaperAccess = (mode = "edit") => {
  return async (req, res, next) => {
    try {
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

      if (isAdmin) {
        return next();
      }

      // Use SQL query to check if user is coauthor
      const request = pool.request();
      request.input("userId", sql.Int, user.id);
      request.input("paperId", sql.Int, paperId);

      const result = await request.query(`
        SELECT TOP 1 1
        FROM author_papers
        WHERE rauthor_id = @userId AND rpaper_id = @paperId
      `);

      const isCoauthor = result.recordset.length > 0;

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
    } catch (err) {
      console.error("Error in checkPaperAccess middleware:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = { checkPaperAccess };
