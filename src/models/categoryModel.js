// models/categoryModel.js

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

// CRUD Logic in same file
async function readAllCategories() {
  try {
    return await Category.find({}, "_id category").lean();
  } catch (error) {
    console.error("❌ Error in readAllCategories:", error);
    throw error;
  }
}

async function readCategoryByName(categoryName) {
  try {
    return await Category.findOne({ category: categoryName }).lean();
  } catch (error) {
    console.error("❌ Error in readCategoryByName:", error);
    throw error;
  }
}

async function createCategory(categoryName) {
  try {
    const category = new Category({ category: categoryName });
    await category.save();
  } catch (error) {
    console.error("❌ Error in createCategory:", error);
    throw error;
  }
}

module.exports = {
  Category,
  readAllCategories,
  readCategoryByName,
  createCategory,
};
