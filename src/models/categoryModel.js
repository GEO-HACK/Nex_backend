const sql = require("mssql");
const config = require("../config/dbConfig"); // your Azure SQL connection config

async function createCategory(category) {
  const pool = await sql.connect(config);
  const lower = category.toLowerCase();
  const result = await pool.request()
    .input('category', sql.VarChar, lower)
    .query('INSERT INTO categories (category) VALUES (@category); SELECT SCOPE_IDENTITY() AS id;');
  return result.recordset[0]; // inserted category id
}

async function readCategoryByName(name) {
  const pool = await sql.connect(config);
  const lower = name.toLowerCase();
  const result = await pool.request()
    .input('category', sql.VarChar, lower)
    .query('SELECT category FROM categories WHERE category = @category');
  return result.recordset[0];
}

async function readCategoryById(id) {
  const pool = await sql.connect(config);
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT category FROM categories WHERE category_id = @id');
  return result.recordset[0];
}

async function readAllCategories() {
  const pool = await sql.connect(config);
  const result = await pool.request()
    .query('SELECT category_id, category FROM categories');
  return result.recordset;
}

module.exports = {
  createCategory,
  readCategoryByName,
  readCategoryById,
  readAllCategories,
};
