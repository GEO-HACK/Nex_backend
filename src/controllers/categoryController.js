const {
  readCategoryByName,
  createCategory,
  readAllCategories,
} = require("../models/categoryModel");

// GET /categories - Retrieve all categories
const getCategories = async (req, res) => {
	console.log("Fetching all categories...");
  try {
    const categories = await readAllCategories();

    if (categories && categories.length > 0) {
      // Return clean JSON structure
      return res.status(200).json({
      
        data: categories,
       
      });

    }	console.log("this are the categories", categories);	

    return res.status(404).json({ message: "No categories found" });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /categories - Add one or more categories
const addCategories = async (req, res) => {
  try {
    const { categories, category } = req.body;

    // Multiple category addition
    if (Array.isArray(categories)) {
      const successfullyAdded = [];
      const failed = [];

      for (const cat of categories) {
        const exists = await readCategoryByName(cat);
        if (exists) {
          failed.push(cat);
        } else {
          await createCategory(cat);
          successfullyAdded.push(cat);
        }
      }

      return res.status(200).json({
        message: "Batch category add complete",
        successfullyAdded,
        failedCount: failed.length,
        failed,
      });
    }

    // Single category addition
    if (category) {
      const exists = await readCategoryByName(category);
      if (exists) {
        return res.status(409).json({ message: "Category already exists" });
      }

      await createCategory(category);
      return res.status(201).json({ message: "Category created successfully" });
    }

    return res.status(400).json({ message: "No category data provided" });

  } catch (error) {
    console.error("Error adding category:", error.message);
    return res.status(500).json({ message: "Failed to add category" });
  }
};

module.exports = {
  getCategories,
  addCategories,
};
