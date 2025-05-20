const { poolConnect, pool } = require("./src/config/dbConfig");

async function testDb() {
  try {
    await poolConnect;
    const request = pool.request();

    // Read from categories table
    const result = await request.query(`
      SELECT category_id, category FROM categories;
    `);

    console.log("✅ Categories in DB:\n", result.recordset);
  } catch (err) {
    console.error("❌ Error reading from categories table:", err);
  }
}

testDb();
