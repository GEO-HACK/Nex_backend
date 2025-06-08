const upload = require("../config/multerConfig");
const paperModel = require("../models/paperModel");


const uploadPaper = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file attached" });
		}

		const fileurl = req.file.location;
		console.log("file upload location: ", fileurl);

		return res.status(200).json({
			message: "paper uploaded successfully",
			fileurl: fileurl,
		});
	} catch (err) {
		console.error("Error in uploadPaper:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const localUploadPaper = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file attached" });
		}

		const baseUrl = "http://localhost:8080";
		const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
		const fileName = req.body.name;
		const category = req.body.category;
		const publisher = req.body.publisher;
		let coauthors = req.body.coauthors || "[]";
		let tags = req.body.tags || "[]";
		const description = req.body.description;
		const meta = req.body.meta;

		console.log(req.body);

		try {
			if (typeof tags === "string") tags = JSON.parse(tags);
			if (typeof coauthors === "string") coauthors = JSON.parse(coauthors);
		} catch (err) {
			return res.status(400).json({ error: "Error parsing tags or coauthors" });
		}

		if (!fileName) return res.status(400).json({ error: "expected file name in the body as: name:<file_name>" });
		if (!category) return res.status(400).json({ error: "expected file category in the body as: category:<1>" });
		if (!description) return res.status(400).json({ error: "expected file description in the body as: description:<file_description>" });
		if (!publisher) return res.status(400).json({ error: "expected file publisher in the body as: publisher:<1>" });
		if (!Array.isArray(tags)) return res.status(400).json({ error: "tags should be an array" });
		if (!Array.isArray(coauthors)) return res.status(400).json({ error: "coauthors should be an array" });
		if (tags.length > 10) return res.status(400).json({ error: "Maximum number of tags associatable to a paper exceeded" });

		const paper = await paperModel.createPaper(category, publisher, fileName, fileUrl, description, meta, tags, coauthors);

		if (!paper) {
			console.error("Paper creation failed: ", paper);
			return res.status(500).json({ error: "Error occurred creating file" });
		} else {
			return res.status(200).json({ message: "Success", paper: paper });
		}
	} catch (err) {
		console.error("Error in localUploadPaper:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const updateLocalPaper = async (req, res) => {
	if (!req.body.id) return res.status(400).json({ error: "Paper id not provided" });
	const paper_id = Number(req.body.id);

	const fields = {
		category_id: req.body.category,
		publisher_id: req.body.publisher,
		paper_name: req.body.name,
		description: req.body.description,
		meta: req.body.meta,
		tags: req.body.tags,
		coauthors: req.body.coauthors,
	};
	if (req.file) fields.fileUrl = req.file.location;

	try {
		const updatedPaper = await paperModel.updatePaper(paper_id, fields);

		if (!updatedPaper) {
			console.error("Error updating paper. Paper:", updatedPaper);
			return res.status(500).json({ error: "error occurred updating file" });
		}
		return res.json({
			message: "success",
			paper: updatedPaper,
		});
	} catch (err) {
		console.log("Error updating paper", err);
		return res.status(500).json({ error: err.message });
	}
};



const getPapers = async (req, res) => {
  try {


    // Query to get all papers from the papers table
     const papers = await paperModel.getPapers();

	 
    // Send the fetched papers in JSON format
    return res.status(200).json({
      data: papers.recordset,
    //   count: papers.recordset.length,
    });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return res.status(500).json({ message: "Failed to fetch papers" });
  }
};


const getPaperById = async (req, res) => {
	const paperId = req.params.id;

	try {
		const paper = await paperModel.getPaperById(paperId);

		if (!paper) {
			return res.status(404).json({ message: "Paper not found" });
		}

		return res.status(200).json(paper);
	} catch (error) {
		console.error("Error fetching paper by ID:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

const updatePaper = async (req, res) => {
	const paperId = req.params.id;

	// This seems to be a placeholder example; you should implement real logic here
	const test_updated = { paperId: 1 };

	if (!test_updated) {
		return res.status(404).json({ message: "resource does not exist" });
	}

	res.status(200).json({ message: "paper updated successfully" });
};

const deletePaper = async (req, res) => {
	const paperId = req.params.id;

	try {
		const deleted = await paperModel.deletePaper(paperId);

		if (!deleted) {
			return res.status(404).json({ message: "Paper not found or already deleted" });
		}

		res.status(200).json({ message: "Paper deleted successfully" });
	} catch (error) {
		console.error("Error deleting paper: ", error);
		return res.status(500).json({ message: "Server error" });
	}
};

const getUserPapers = async (req, res) => {
	try {
		const publisherName = req.user.username;

		const papers = await paperModel.getPapersByUserId(publisherName);

		if (!papers || papers.length === 0) {
			return res.status(404).json({ message: "No papers found for this user" });
		}
		return res.status(200).json({ papers });
	} catch (error) {
		console.error("Error fetching user papers: ", error);
		return res.status(500).json({ message: "Server error" });
	}
};

module.exports = {
	uploadPaper,
	localUploadPaper,
	updateLocalPaper,
	getPapers,
	getPaperById,
	updatePaper,
	deletePaper,
	getUserPapers,
};
