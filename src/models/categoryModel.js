const { pool, poolConnect } = require("../config/dbConfig");

// READ ALL categories
async function readAllCategories() {
  try {
    await poolConnect;
    const result = await pool.request().query("SELECT category_id, category FROM categories");
    return result.recordset;
  } catch (error) {
    console.error("❌ Error in readAllCategories:", error);
    throw error;
  }
}

// READ category by name
async function readCategoryByName(categoryName) {
  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("category", categoryName)
      .query("SELECT * FROM categories WHERE category = @category");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error("❌ Error in readCategoryByName:", error);
    throw error;
  }
}

// CREATE category
async function createCategory(categoryName) {
  try {
    await poolConnect;
    await pool
      .request()
      .input("category", categoryName)
      .query("INSERT INTO categories (category) VALUES (@category)");
  } catch (error) {
    console.error("❌ Error in createCategory:", error);
    throw error;
  }
}

module.exports = {
  readAllCategories,
  readCategoryByName,
  createCategory,
};
