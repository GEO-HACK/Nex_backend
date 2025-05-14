const db = require("../config/dbConfig");

const createCategory = (category) => {
	const lower = category.toLowerCase();
	const stmt = db.prepare("INSERT INTO categories (category) VALUES (?)");
	return stmt.run(lower);
};

const readCategoryByName = (name) => {
	const lower = name.toLowerCase();
	const stmt = db.prepare("SELECT category FROM categories WHERE category = ?");

	return stmt.get(lower);
};

const readCategoryById = (id) => {
	const stmt = db.prepare("SELECT category FROM categories WHERE category_id = ?");

	return stmt.get(id);
};

const readAllCategories = () => {
	const stmt = db.prepare("SELECT category_id, category FROM categories");

	return stmt.all();
};

module.exports = {
	createCategory,
	readCategoryByName,
	readCategoryById,
	readAllCategories,
};
