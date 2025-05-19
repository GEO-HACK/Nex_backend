// papersModel_mssql.js
const sql = require("mssql");
const config = require("../config/dbConfig");
const { readUserById } = require("./userModel");

async function createPaper(category_id, publisher_id, paper_name, file_url, description, meta = null, tags = [], coauthors = []) {
  try {
    await sql.connect(config);

    const tagJson = JSON.stringify(tags || []);
    const deleted = 0;

    const result = await sql.query`
      INSERT INTO papers (category_id, publisher_id, paper_name, file_url, description, meta, tags, deleted)
      OUTPUT INSERTED.paper_id
      VALUES (${category_id}, ${publisher_id}, ${paper_name}, ${file_url}, ${description}, ${meta}, ${tagJson}, ${deleted})
    `;

    const paper_id = result.recordset[0].paper_id;

    if (coauthors.length > 0) {
      const allAuthors = new Set([Number(publisher_id), ...coauthors]);

      for (const author of allAuthors) {
        const user = await readUserById(author);
        if (!user) throw new Error(`Author ID ${author} does not exist`);
        await sql.query`INSERT INTO author_papers (rauthor_id, rpaper_id) VALUES (${author}, ${paper_id})`;
      }
    }

    return await getPaperObjectById(paper_id);
  } catch (err) {
    throw new Error(`Error creating paper: ${err.message}`);
  }
}

async function updatePaper(paper_id, fields = {}) {
  try {
    await sql.connect(config);

    const allowedFields = ["category_id", "publisher_id", "paper_name", "file_url", "description", "meta"];
    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = @${key}`);
        values.push({ name: key, type: sql.NVarChar, value: fields[key] });
      }
    }

    if (fields.tags) {
      updates.push(`tags = @tags`);
      values.push({ name: "tags", type: sql.NVarChar, value: JSON.stringify(fields.tags) });
    }

    if (updates.length > 0) {
      const setClause = updates.join(", ");
      const request = new sql.Request();
      for (const val of values) request.input(val.name, val.type, val.value);
      request.input("paper_id", sql.Int, paper_id);

      await request.query(`UPDATE papers SET ${setClause} WHERE paper_id = @paper_id`);
    }

    if (fields.coauthors) {
      await sql.query`DELETE FROM author_papers WHERE rpaper_id = ${paper_id}`;

      const existing = fields.publisher_id ? fields.publisher_id : (await getPaperObjectById(paper_id)).publisher_id;
      const allAuthors = new Set([Number(existing), ...fields.coauthors.map(Number)]);

      for (const author of allAuthors) {
        const user = await readUserById(author);
        if (!user) throw new Error(`Author ID ${author} does not exist`);
        await sql.query`INSERT INTO author_papers (rauthor_id, rpaper_id) VALUES (${author}, ${paper_id})`;
      }
    }

    return await getPaperObjectById(paper_id);
  } catch (err) {
    throw new Error(`Error updating paper: ${err.message}`);
  }
}

async function getPaperObjectById(paper_id) {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM papers WHERE paper_id = ${paper_id} AND deleted = 0`;
    return result.recordset[0];
  } catch (err) {
    throw new Error(`Error fetching paper: ${err.message}`);
  }
}

async function getPapers(filters = {}, offset = 0, limit = 30) {
  try {
    await sql.connect(config);

    let query = `
      SELECT DISTINCT p.* FROM papers p
      LEFT JOIN author_papers ap ON p.paper_id = ap.rpaper_id
      WHERE p.deleted = 0
    `;

    const request = new sql.Request();
    if (filters.id) {
      query += ` AND p.paper_id = @id`;
      request.input("id", sql.Int, filters.id);
    }
    if (filters.category) {
      query += ` AND p.category_id = @category`;
      request.input("category", sql.Int, filters.category);
    }
    if (filters.publisher_id) {
      query += ` AND p.publisher_id = @publisher_id`;
      request.input("publisher_id", sql.Int, filters.publisher_id);
    }
    if (filters.author_id) {
      query += ` AND ap.rauthor_id = @author_id`;
      request.input("author_id", sql.Int, filters.author_id);
    }
    if (filters.q) {
      query += ` AND (p.paper_name LIKE @q OR p.description LIKE @q)`;
      request.input("q", sql.NVarChar, `%${filters.q}%`);
    }
    if (filters.tag) {
      query += ` AND p.tags LIKE @tag`;
      request.input("tag", sql.NVarChar, `%${filters.tag}%`);
    }

    query += ` ORDER BY p.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    throw new Error(`Error fetching papers: ${err.message}`);
  }
}

async function getPaperById(paperId) {
  try {
    await sql.connect(config);
    const paperResult = await sql.query`SELECT * FROM papers WHERE paper_id = ${paperId} AND deleted = 0`;
    if (paperResult.recordset.length === 0) return null;

    const paper = paperResult.recordset[0];

    const tagResult = await sql.query`SELECT tag_id FROM paper_tags WHERE paper_id = ${paperId}`;
    const tags = tagResult.recordset.map(r => r.tag_id);

    const authorResult = await sql.query`SELECT rauthor_id FROM author_papers WHERE rpaper_id = ${paperId}`;
    const coauthors = authorResult.recordset.map(r => r.rauthor_id);

    return { ...paper, tags, coauthors };
  } catch (err) {
    throw new Error(`Error fetching paper by ID: ${err.message}`);
  }
}

async function getPapersByUserId(userId) {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT p.*
      FROM papers p
      JOIN users u ON p.publisher_id = u.id
      WHERE u.id = ${userId} AND p.deleted = 0
    `;
    return result.recordset;
  } catch (err) {
    throw new Error(`Error fetching papers by user: ${err.message}`);
  }
}

async function deletePaper(paperId) {
  try {
    await sql.connect(config);
    const result = await sql.query`DELETE FROM papers WHERE paper_id = ${paperId}`;
    return result.rowsAffected[0] > 0;
  } catch (err) {
    throw new Error(`Error deleting paper: ${err.message}`);
  }
}

module.exports = {
  createPaper,
  updatePaper,
  getPapers,
  getPaperById,
  deletePaper,
  getPapersByUserId,
  getPaperObjectById,
};
