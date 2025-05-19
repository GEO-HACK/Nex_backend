const { poolConnect, pool } = require("./dbConfig");

async function setupDb() {
  try {
    await poolConnect;

    const request = pool.request();

    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='institutions' AND xtype='U')
      CREATE TABLE institutions (
        institution_id INT PRIMARY KEY IDENTITY(1,1),
        institution_name VARCHAR(255) NOT NULL
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        institution_id INT NOT NULL,
        fname VARCHAR(100) NOT NULL,
        lname VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
      CREATE TABLE categories (
        category_id INT PRIMARY KEY IDENTITY(1,1),
        category VARCHAR(100) UNIQUE NOT NULL
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tags' AND xtype='U')
      CREATE TABLE tags (
        tag_id INT PRIMARY KEY IDENTITY(1,1),
        tag VARCHAR(100) UNIQUE NOT NULL
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='papers' AND xtype='U')
      CREATE TABLE papers (
        paper_id INT PRIMARY KEY IDENTITY(1,1),
        category_id INT NOT NULL,
        publisher_id INT NOT NULL,
        paper_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        description TEXT,
        meta TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        deleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='paper_tags' AND xtype='U')
      CREATE TABLE paper_tags (
        paper_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (paper_id, tag_id),
        FOREIGN KEY (paper_id) REFERENCES papers(paper_id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='author_papers' AND xtype='U')
      CREATE TABLE author_papers (
        rauthor_id INT NOT NULL,
        rpaper_id INT NOT NULL,
        PRIMARY KEY (rauthor_id, rpaper_id),
        FOREIGN KEY (rauthor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (rpaper_id) REFERENCES papers(paper_id) ON DELETE CASCADE
      );
    `);

    console.log("✅ Azure SQL Server: Database schema setup completed.");
  } catch (err) {
    console.error("❌ Database setup failed:", err);
  }
}

module.exports = { setupDb };
