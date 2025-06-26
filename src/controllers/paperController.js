const upload = require("../config/multerConfig");
const paperModel = require("../models/paperModel");
const User = require("../models/userModel");


// In paperController.js

const createPaper = async (req, res) => {
  try {
    // Parse fields from the request body
    const {
      paper_name,
      description,
      category_id,
      meta,
      tags = [],
      coauthors = [],
    } = req.body;

    // Parse arrays/objects if sent as strings
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    const parsedCoauthors = typeof coauthors === "string" ? JSON.parse(coauthors) : coauthors;
    const parsedMeta = typeof meta === "string" && meta ? JSON.parse(meta) : meta;

    // Handle file upload
    let file_url = req.file ? `/uploads/${req.file.filename}` : req.body.file_url || null;

    // Get publisher_id from authenticated user
    const publisher_id = req.user.id;

    // Call the model's createPaper function
    const paper = await paperModel.createPaper({
      category_id,
      paper_name,
      file_url,
      description,
      meta: parsedMeta,
      tags: parsedTags,
      coauthors: parsedCoauthors,
      publisher_id, // Pass publisher_id explicitly
    });

    res.status(201).json({
      message: "Paper created successfully",
      paper,
    });
  } catch (error) {
    console.error("Error creating paper:", error);
    res.status(500).json({
      message: "Failed to create paper",
      error: error.message,
    });
  }
};


	



const updateLocalPaper = async (req, res) => {
	if (!req.body.id) return res.status(400).json({ error: "Paper id not provided" });
	let paper_id;

	try{
		paper_id = new mongoose.Types.ObjectId(req.body._id);

	}catch(error){
		return res.status(400).json({ error: "Invalid paper id" });
	}

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


     const papers = await paperModel.getPapers();
	 

	 
    return res.status(200).json(papers);
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
		const userId = req.user.id;

		const papers = await paperModel.getPapersByUserId(userId);

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
	createPaper,
	updateLocalPaper,
	getPapers,
	getPaperById,
	updatePaper,
	deletePaper,
	getUserPapers,
};
