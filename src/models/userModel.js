const db = require("../config/dbConfig");

const createUser = (institutionName, lname, fname, username, email, role, password) => {
	const institutionId = joinInstitution(institutionName);

	console.log("All details: ")
	console.log("Password: ", password)

	const stmt = db.prepare("INSERT INTO users (institution_id, fname, lname, username, email, role, password) VALUES(?, ?, ?, ?, ?, ?, ?)");
	return stmt.run(institutionId, fname, lname, username, email, role, password);
};

const joinInstitution = (institutionName) => {
	try {
		let stmt = db.prepare("SELECT institution_id FROM institutions WHERE institution_name = ?");
		let institution = stmt.get(institutionName);

		if (!institution) {
			stmt = db.prepare("INSERT INTO institutions (institution_name) VALUES (?)");
			const result = stmt.run(institutionName);
			return result.lastInsertRowid;
		}

		return institution.institution_id;
	} catch (error) {
		throw new Error(`Error fetching institution id: ${error}`);
	}
};

const readUserByMail = (email) => {
	const stmt = db.prepare("SELECT * FROM users WHERE email = ? ");
	return stmt.get(email);
};

const readUserById = (id) => {
	const stmt = db.prepare("SELECT id, fname, lname, email, role FROM users WHERE id = ?");
	return stmt.get(id);
};

const getAuthors = (query, limit=10) => {
	let stmt = db.prepare(`
	SELECT DISTINCT id, fname, lname, username, institution_id
	FROM users
	WHERE (users.fname LIKE ? OR users.lname LIKE ? OR users.username LIKE ?) AND role='Author'
	LIMIT ?
	`);
	
	const authors = stmt.all(`%${query}%`, `%${query}%`, `%${query}%`, limit);
	console.log("Fetched authors: ", authors)
	return authors

}

module.exports = {
	createUser,
	readUserByMail,
	readUserById,
	getAuthors,
};
