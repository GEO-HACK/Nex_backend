const db = require("./dbConfig"); // Import database connection

/**
 * Research papers must have a "research" prefix
 */

function setupDb() {
	try {
		db.exec("PRAGMA foreign_keys = ON;"); // Enable foreign keys before everything
		
		db.exec(` 
			CREATE TABLE IF NOT EXISTS institutions (
				institution_id INTEGER PRIMARY KEY AUTOINCREMENT,
				institution_name TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				institution_id INTEGER NOT NULL,
				fname TEXT NOT NULL,
				lname TEXT NOT NULL, 
				username TEXT NOT NULL,
				email TEXT UNIQUE NOT NULL,
				role TEXT NOT NULL,
				password TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE
			);

			CREATE TABLE IF NOT EXISTS categories (
				category_id INTEGER PRIMARY KEY AUTOINCREMENT,
				category TEXT UNIQUE NOT NULL
			);

			CREATE TABLE IF NOT EXISTS tags (
				tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
				tag TEXT UNIQUE NOT NULL
			);

			CREATE TABLE IF NOT EXISTS paper_tags (
				paper_id INTEGER NOT NULL,
				tag_id INTEGER NOT NULL,
				PRIMARY KEY (paper_id, tag_id),
				FOREIGN KEY (paper_id) REFERENCES papers(paper_id) ON DELETE CASCADE,
				FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
			);

			CREATE TABLE IF NOT EXISTS papers (
				paper_id INTEGER PRIMARY KEY AUTOINCREMENT,
				category_id INTEGER NOT NULL,
				publisher_id INTEGER NOT NULL,
				paper_name TEXT NOT NULL,
				file_url TEXT NOT NULL,
				description TEXT,
				meta TEXT,
				tags TEXT,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0,1)),
				FOREIGN KEY(category_id) REFERENCES categories(category_id) ON DELETE CASCADE
			);


			CREATE TABLE IF NOT EXISTS author_papers (
				rauthor_id INTEGER NOT NULL,
				rpaper_id INTEGER NOT NULL,
				PRIMARY KEY (rauthor_id, rpaper_id),
				FOREIGN KEY (rauthor_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (rpaper_id) REFERENCES papers(paper_id) ON DELETE CASCADE
			);
		`);
		console.log("Database setup completed.");
	} catch (error) {
		console.error("Database setup error:", error);
	}
}

/**
 * CREATE TRIGGER update_paper_timestamp
 * AFTER UPDATE ON papers
 * FOR EACH ROW
 * BEGIN
 * UPDATE papers SET updated_at = CURRENT_TIMESTAMP WHERE paper_id = OLD.paper_id;
 * END;
 *
 */

module.exports = { setupDb };
