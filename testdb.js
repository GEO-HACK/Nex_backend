const { poolConnect, pool } = require("./src/config/dbConfig");

async function fetchPapers() {
  try {
    await poolConnect; // ensure pool has connected

    const result = await pool.request().query('SELECT * FROM papers');

    console.log('Fetched papers:', result.recordset);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching papers:', err);
  }
}

fetchPapers();
