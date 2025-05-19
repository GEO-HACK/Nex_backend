const sql = require("mssql");
const config = require("../config/dbConfig"); // Your Azure SQL config here

const ALLOWED_TABLES = ["papers", "users", "categories", "author_papers", "tags", "paper_tags"];

/**
 * Drops a table if it exists
 * @param {string} table - Table name to drop
 * @returns {Promise<boolean>}
 */
async function resetTable(table) {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error("Unrecognized table");
  }

  try {
    const pool = await sql.connect(config);
    const dropQuery = `
      IF OBJECT_ID('${table}', 'U') IS NOT NULL
        DROP TABLE ${table};
    `;
    await pool.request().query(dropQuery);
    return true;
  } catch (error) {
    console.error("Error resetting table:", error);
    return false;
  }
}

/**
 * Reads all rows from a table (allowed only)
 * @param {string} table - Table name
 * @returns {Promise<Array>}
 */
async function readTable(table) {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error("Unrecognized table");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT * FROM ${table}`);
    return result.recordset;
  } catch (error) {
    console.error("Error reading table:", error);
    throw error;
  }
}

/**
 * Resets (drops) all allowed tables
 * WARNING: This deletes all tables and data.
 * @returns {Promise<boolean>}
 */
async function resetAllTables() {
  try {
    const pool = await sql.connect(config);

    // Disable FK constraints
    await pool.request().query(`
      EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
    `);

    // Drop all allowed tables
    for (const table of ALLOWED_TABLES) {
      const dropQuery = `
        IF OBJECT_ID('${table}', 'U') IS NOT NULL
          DROP TABLE ${table};
      `;
      await pool.request().query(dropQuery);
    }

    // Enable FK constraints
    await pool.request().query(`
      EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
    `);

    return true;
  } catch (error) {
    console.error("Error resetting all tables:", error);
    return false;
  }
}

/**
 * Restore tables from a SQL script file
 * Note: This method assumes the script contains valid T-SQL for Azure SQL.
 * @param {string} backupFilePath - Full path to SQL script backup file
 * @returns {Promise<boolean>}
 */
const fs = require("fs").promises;

async function restoreTables(backupFilePath) {
  try {
    const fileContent = await fs.readFile(backupFilePath, "utf8");
    const pool = await sql.connect(config);

    // Split by GO batch separators and filter empty
    const batches = fileContent.split(/^\s*GO\s*$/im).filter(b => b.trim());

    for (const batch of batches) {
      await pool.request().batch(batch);
    }

    return true;
  } catch (error) {
    console.error("Error restoring tables:", error);
    return false;
  }
}

/**
 * Recreate tables by running your DB setup script (or migration)
 * Implement your table creation logic here
 * @returns {Promise<boolean>}
 */
async function recreateTables() {
  try {
    const pool = await sql.connect(config);

    // Example: create categories table
    const createCategories = `
      CREATE TABLE categories (
        category_id INT IDENTITY(1,1) PRIMARY KEY,
        category NVARCHAR(255) NOT NULL UNIQUE
      );
    `;

    // Run create tables queries (add others similarly)
    await pool.request().query(createCategories);

    // Add other table creation queries here

    return true;
  } catch (error) {
    console.error("Error recreating tables:", error);
    return false;
  }
}

module.exports = {
  resetTable,
  readTable,
  resetAllTables,
  restoreTables,
  recreateTables,
};
