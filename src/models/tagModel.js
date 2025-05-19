const { poolConnect, pool } = require("../config/dbConfig");

const createTag = async (tag) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input("tag", tag);
    const result = await request.query(
      `INSERT INTO tags (tag) VALUES (@tag);
       SELECT SCOPE_IDENTITY() AS insertedId;`
    );
    return result.recordset[0].insertedId;
  } catch (error) {
    console.error("Error creating tag", error);
    throw error;
  }
};

// Get tags allows filtering tags
const getTags = async (id, q) => {
  try {
    await poolConnect;
    const request = pool.request();

    let query = "SELECT * FROM tags WHERE 1=1";

    if (id) {
      query += " AND tag_id = @id";
      request.input("id", id);
    }

    if (q) {
      query += " AND (tag LIKE @q)";
      request.input("q", `%${q}%`);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error filtering tags", error);
    return null;
  }
};

module.exports = {
  createTag,
  getTags,
};
