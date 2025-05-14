const db = require("../config/dbConfig");
const database = require("../config/dbSetupConfig");
const fs = require("fs");
const path = require("path");

const BACKUP_PATH = "../backups";

const resetTable = (table) => {
	stmt = db.prepare(`DROP TABLE IF EXISTS ${table}`);

	try {
		stmt.run();
		return true;
	} catch (error) {
        console.error("Error resetting table: ", error)
		return false;
	}
};

const resetAllTables = () => {
	try {
		const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
		if (tables.length === 0) {
			console.log("No tables found.");
			return null;
		}

		// Generate a unique backup file with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Avoid invalid filename characters
		const backupFile = path.join(__dirname, `${BACKUP_PATH}/backup_${timestamp}.sql`);

		// Backup table schemas
		let backupSQL = "";
		tables.forEach(({ name }) => {
			const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(name);
			if (schema && schema.sql) {
				backupSQL += schema.sql + ";\n";
			}
		});

		// Save the backup
		fs.writeFileSync(backupFile, backupSQL, "utf8");
		console.log(`Backup saved to ${backupFile}`);

		// Drop tables
		db.prepare(`PRAGMA foreign_keys = OFF`).run();
		db.transaction(() => {
			tables.forEach(({ name }) => {
				db.prepare(`DROP TABLE IF EXISTS "${name}"`).run();
			});
		});

		db.prepare(`PRAGMA foreign_keys = ON`).run();

		console.log("All tables deleted successfully.");
		return backupFile; // Return the backup file path
	} catch (error) {
		console.error("Error deleting tables:", error);
		return null;
	}
};

const restoreTables = (backupFile) => {
	try {
		if (!fs.existsSync(backupFile)) {
			console.log("Backup file not found:", backupFile);
			return false;
		}

		const backupSQL = fs.readFileSync(backupFile, "utf8");
		const queries = backupSQL.split(";\n").filter((query) => query.trim());

		db.transaction(() => {
			queries.forEach((query) => {
				db.prepare(query).run();
			});
		});

		console.log(`Tables restored successfully from ${backupFile}`);
		return true;
	} catch (error) {
		console.error("Error restoring tables:", error);
		return false;
	}
};

const recreateTables = () => {
	try {
		database.setupDb();
		return true;
	} catch {
		return false;
	}
};

const readTable = (table) => {
	const ALLOWED_TABLES = ["papers", "users", "categories", "author_papers", "tags", "paper_tags"];

	if (!ALLOWED_TABLES.includes(table)){
		throw new Error("Unrecognized table")
	}
	const stmt = db.prepare(`SELECT * FROM "${table}"`)
	return stmt.all()
}

module.exports = {
    resetTable,
	resetAllTables,
	recreateTables,
	restoreTables,
	readTable
};
