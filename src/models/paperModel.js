// papersModel_mongo.js
const mongoose = require("mongoose");

// ----- SCHEMA DEFINITIONS -----

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  // Add other fields as needed
});

const paperSchema = new mongoose.Schema(
  {
    category_id: mongoose.Schema.Types.ObjectId,
    publisher_id: mongoose.Schema.Types.ObjectId,
    paper_name: String,
    file_url: String,
    description: String,
    meta: mongoose.Schema.Types.Mixed,
    tags: [String],
    coauthors: [mongoose.Schema.Types.ObjectId],
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

const Paper = mongoose.model("Paper", paperSchema);

// ----- DATA ACCESS FUNCTIONS -----

async function createPaper(category_id, publisher_id, paper_name, file_url, description, meta = null, tags = [], coauthors = []) {
  try {
    const paper = new Paper({
      category_id,
      publisher_id,
      paper_name,
      file_url,
      description,
      meta,
      tags,
      deleted: false,
    });

    await paper.save();
    const paper_id = paper._id;

    const allAuthors = new Set([publisher_id.toString(), ...coauthors.map(String)]);
    for (const author of allAuthors) {
      const user = await User.findById(author);
      if (!user) throw new Error(`Author ID ${author} does not exist`);
      paper.coauthors.push(author);
    }

    await paper.save();
    return paper;
  } catch (err) {
    throw new Error(`Error creating paper: ${err.message}`);
  }
}

async function updatePaper(paper_id, fields = {}) {
  try {
    const paper = await Paper.findById(paper_id);
    if (!paper) throw new Error("Paper not found");

    const allowedFields = ["category_id", "publisher_id", "paper_name", "file_url", "description", "meta", "tags"];
    allowedFields.forEach((field) => {
      if (fields[field] !== undefined) paper[field] = fields[field];
    });

    if (fields.coauthors) {
      const allAuthors = new Set([
        (fields.publisher_id || paper.publisher_id).toString(),
        ...fields.coauthors.map(String),
      ]);

      paper.coauthors = [];
      for (const author of allAuthors) {
        const user = await User.findById(author);
        if (!user) throw new Error(`Author ID ${author} does not exist`);
        paper.coauthors.push(author);
      }
    }

    await paper.save();
    return paper;
  } catch (err) {
    throw new Error(`Error updating paper: ${err.message}`);
  }
}

async function getPaperById(paper_id) {
  try {
    return await Paper.findOne({ _id: paper_id, deleted: false });
  } catch (err) {
    throw new Error(`Error fetching paper by ID: ${err.message}`);
  }
}

async function getPapers(filters = {}, offset = 0, limit = 30) {
  try {
    const query = {};

    if (filters.id) query._id = filters.id;
    if (filters.category) query.category_id = filters.category;
    if (filters.publisher_id) query.publisher_id = filters.publisher_id;
    if (filters.tag) query.tags = { $regex: filters.tag, $options: "i" };
    if (filters.q) {
      query.$or = [
        { paper_name: { $regex: filters.q, $options: "i" } },
        { description: { $regex: filters.q, $options: "i" } },
      ];
    }
    if (filters.author_id) {
      query.coauthors = filters.author_id;
    }

    return await Paper.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  } catch (err) {
    throw new Error(`Error fetching papers: ${err.message}`);
  }
}

async function getPapersByUserId(user_id) {
  try {
    return await Paper.find({ publisher_id: user_id, deleted: false });
  } catch (err) {
    throw new Error(`Error fetching papers by user: ${err.message}`);
  }
}

async function deletePaper(paper_id) {
  try {
    const result = await Paper.findByIdAndUpdate(paper_id, { deleted: true });
    return !!result;
  } catch (err) {
    throw new Error(`Error deleting paper: ${err.message}`);
  }
}

// ----- EXPORT FUNCTIONS -----

module.exports = {
  createPaper,
  updatePaper,
  getPaperById,
  getPapers,
  getPapersByUserId,
  deletePaper,
};
