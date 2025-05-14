const { readCategoryByName, createCategory, readAllCategories } = require("../models/categoryModel");

const getCategories = (req, res) => {
	const categories = readAllCategories();
	if (categories) {
		return res.status(200).json(categories);
	}
	return res.status(404).json({ message: "Not Found: No categories found" });
};

const addCategories = (req, res) => {
	const { categories } = req.body;
	// return res.status(403).json({ message: "Forbidden: cannot add new categories" });

	let successfullyAddedCategories = [];
	let failed = []

	if (Array.isArray(categories)) {
		categories.forEach((category) => {
			if (readCategoryByName(category)) {
				console.warn(`category ${category} exists`);
				failed.push(category)
			} else if (createCategory(category)) {
				successfullyAddedCategories.push(category);
			}
		});

		return res.status(200).json({
			message: "task complete",
			num_of_failed: categories.length - successfullyAddedCategories.length,
			failed: failed
		});
	}

	if (readCategoryByName(category)) {
		return res.status(409).json({ message: "Category exists" });
	}

	if (createCategory(category)) {
		return res.status(200).json({ message: "New category added" });
	}

	return res.status(500).json({ message: "Failed to add new category" });
};

module.exports = {
	getCategories,
	addCategories,
};
