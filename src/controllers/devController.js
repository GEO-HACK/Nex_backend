const dev = require("../models/devModel");

const readTable = (req, res) => {
	const table = req.query.table;
	console.log(req.query.table);

	if (!table) {
		return res.status(400).json({ message: "You must specify the table to be read" });
	}

	try {
		tableContents = dev.readTable(table);
	} catch (error) {
		console.error("Error occured: ", error)
		return res.status(404).json({ message: "the requested table could not be found or is empty" });
	}

	return res.status(200).json({ table: tableContents });
};

const resetTable = (req, res) => {
	const table = req.query.table;
	if (!table) {
		return res.status(400).json({ message: "You must specify the table to be reset" });
	}

	if (dev.resetTable(table)) {
		try {
			dev.recreateTables();
		} catch (error) {
			return res.status(400).json({ message: "operation failed", error: error });
		}
	} else {
		return res.status(400).json({ message: "operation failed", error: "Could not reset the specified table" });
	}

	return res.status(200).json({ message: `table ${table} reset successfully` });
};

const resetTables = (req, res) => {
	if (dev.resetAllTables() === false) {
		return res.status(500).json({ message: "operation failed" });
	}

	dev.recreateTables();

	return res.status(200).json({ message: "tables reset successfully" });
};

const restoreTables = (req, res) => {
	const { backupFile } = req.body;

	if (!backupFile) {
		return res.status(400).json({ message: "backup file path is required" });
	}

	const success = dev.restoreTables(backupFile);

	if (!success) {
		return res.status(500).json({ message: "File restore failed, check logs for errors" });
	}

	return res.status(200).json({ message: "Database successfully restored" });
};

module.exports = {
	resetTable,
	resetTables,
	restoreTables,
	readTable,
};
