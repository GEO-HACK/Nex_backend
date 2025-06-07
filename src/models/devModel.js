// utils/dbUtils.js (MongoDB version)

const mongoose = require("mongoose");
const fs = require("fs").promises;

const Category = require("../models/categoryModel");
// import other models like User, Paper, etc. as needed

const ALLOWED_COLLECTIONS = {
  categories: Category,
  // users: User,
  // papers: Paper,
  // tags: Tag,
  // paper_tags: PaperTag,
  // etc.
};

/**
 * Drops a MongoDB collection if allowed
 */
async function resetCollection(collectionName) {
  const Model = ALLOWED_COLLECTIONS[collectionName];
  if (!Model) throw new Error("Unrecognized collection");

  try {
    await Model.deleteMany({});
    return true;
  } catch (err) {
    console.error("Error resetting collection:", err);
    return false;
  }
}

/**
 * Reads all documents from a collection
 */
async function readCollection(collectionName) {
  const Model = ALLOWED_COLLECTIONS[collectionName];
  if (!Model) throw new Error("Unrecognized collection");

  try {
    return await Model.find().lean();
  } catch (err) {
    console.error("Error reading collection:", err);
    throw err;
  }
}

/**
 * Drops all collections
 */
async function resetAllCollections() {
  try {
    for (const name in ALLOWED_COLLECTIONS) {
      await ALLOWED_COLLECTIONS[name].deleteMany({});
    }
    return true;
  } catch (err) {
    console.error("Error resetting all collections:", err);
    return false;
  }
}

/**
 * Restore from a JSON file backup
 * Format: { categories: [...], users: [...], etc. }
 */
async function restoreCollectionsFromJSON(filePath) {
  try {
    const json = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(json);

    for (const [key, docs] of Object.entries(data)) {
      if (!ALLOWED_COLLECTIONS[key]) continue;
      await ALLOWED_COLLECTIONS[key].insertMany(docs);
    }

    return true;
  } catch (err) {
    console.error("Error restoring from JSON:", err);
    return false;
  }
}

module.exports = {
  resetCollection,
  resetAllCollections,
  readCollection,
  restoreCollectionsFromJSON,
};
