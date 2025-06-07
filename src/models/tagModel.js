// tagsModel_mongo.js
const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true },
});

const Tag = mongoose.model("Tag", tagSchema);

async function createTag(tag) {
  try {
    const newTag = new Tag({ tag });
    await newTag.save();
    return newTag._id;
  } catch (error) {
    console.error("Error creating tag", error);
    throw error;
  }
}

async function getTags(id, q) {
  try {
    const filter = {};
    if (id) {
      filter._id = id;
    }
    if (q) {
      filter.tag = { $regex: q, $options: "i" };
    }
    return await Tag.find(filter);
  } catch (error) {
    console.error("Error filtering tags", error);
    return null;
  }
}

module.exports = {
  createTag,
  getTags,
};
