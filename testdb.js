const { poolConnect, pool } = require("./src/config/dbConfig");

async function testDb() {
  try {
    await poolConnect;
    const request = pool.request();

    // Insert institution
    const institutionResult = await request.query(`
      INSERT INTO institutions (institution_name)
      OUTPUT INSERTED.institution_id
      VALUES ('Jomo Kenyatta University');
    `);
    const institutionId = institutionResult.recordset[0].institution_id;

    // Insert category
    const categoryResult = await request.query(`
      INSERT INTO categories (category)
      OUTPUT INSERTED.category_id
      VALUES ('Agriculture');
    `);
    const categoryId = categoryResult.recordset[0].category_id;

    // Insert tags
    const tagResult1 = await request.query(`
      INSERT INTO tags (tag)
      OUTPUT INSERTED.tag_id
      VALUES ('AI');
    `);
    const tagResult2 = await request.query(`
      INSERT INTO tags (tag)
      OUTPUT INSERTED.tag_id
      VALUES ('Farming');
    `);
    const tagId1 = tagResult1.recordset[0].tag_id;
    const tagId2 = tagResult2.recordset[0].tag_id;

    // Insert users
    const userResult1 = await request.query(`
      INSERT INTO users (institution_id, fname, lname, username, email, role, password)
      OUTPUT INSERTED.id
      VALUES (${institutionId}, 'Geoffrey', 'Mbugua', 'geoffrey', 'geoff@example.com', 'admin', 'hashed_password');
    `);
    const userId1 = userResult1.recordset[0].id;

    const userResult2 = await request.query(`
      INSERT INTO users (institution_id, fname, lname, username, email, role, password)
      OUTPUT INSERTED.id
      VALUES (${institutionId}, 'Alice', 'Smith', 'alice', 'alice@example.com', 'researcher', 'hashed_password');
    `);
    const userId2 = userResult2.recordset[0].id;

    // Insert paper
    const paperResult = await request.query(`
      INSERT INTO papers (category_id, publisher_id, paper_name, file_url, description, meta, tags)
      OUTPUT INSERTED.paper_id
      VALUES (
        ${categoryId},
        ${userId1},
        'AI in Agriculture',
        'https://example.com/paper.pdf',
        'This paper discusses AI use in agriculture.',
        'meta:ai-agriculture',
        '["AI", "Farming"]'
      );
    `);
    const paperId = paperResult.recordset[0].paper_id;

    // Insert into paper_tags
    await request.query(`
      INSERT INTO paper_tags (paper_id, tag_id) VALUES (${paperId}, ${tagId1});
      INSERT INTO paper_tags (paper_id, tag_id) VALUES (${paperId}, ${tagId2});
    `);

    // Add co-author
    await request.query(`
      INSERT INTO author_papers (rauthor_id, rpaper_id) VALUES (${userId2}, ${paperId});
    `);

    // Fetch and log paper details
    const fetchResult = await request.query(`
      SELECT p.paper_id, p.paper_name, u.username AS publisher, c.category, p.tags, t.tag
      FROM papers p
      JOIN users u ON p.publisher_id = u.id
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN paper_tags pt ON p.paper_id = pt.paper_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.paper_id = ${paperId};
    `);

    console.log("✅ Paper Details with Tags:\n", fetchResult.recordset);
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

testDb();
