const db = require("../config/dbConfig");


const createTag = (tag) => {
	const stmt = db.prepare("INSERT INTO tags (tag) VALUES(?)");
	return stmt.run(field, tag)
};


//Get tags allows filtering tags
const getTags = (id, q) => {
	let query = "SELECT * FROM tags WHERE 1=1"
	const params = []

	try {
		// if (field) {
		// 	query += " AND field = ?";
		// 	params.push(field)
		// }

		if (id) {
			query += " AND tag_id = ?"
			params.push(id)
		}

		if (q) {
			query += " AND (tag LIKE ? OR field LIKE ?)"
			params.push(`%${q}%`, `%${q}%`);
		}

		const stmt = db.prepare(query)
		return stmt.all(...params)
	}catch(error){
		console.error("Error filtering tags", error)
		return null;
	}
}

module.exports = {
	createTag,
	getTags
};
