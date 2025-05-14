const db = require("../config/dbConfig");
const { readUserById } = require("./userModel");

const createPaper = (category_id, publisher_id, paper_name, file_url, description, meta = null, tags = null, coauthors = null) => {
	const deleted = 0;
	const tagJson = JSON.stringify(tags || []);
	const stmt = db.prepare("INSERT INTO papers (category_id, publisher_id, paper_name, file_url, description, meta, tags, deleted) VALUES(?,?,?,?,?,?,?,?)");

	const result = stmt.run(category_id, publisher_id, paper_name, file_url, description, meta, tagJson, deleted);
	if (!result.changes) return null;

	const paper_id = result.lastInsertRowid;

	// Add all associated tags
	// try {
	// 	if (tags.length > 0) {
	// 		const tagStmt = db.prepare("INSERT INTO paper_tags (paper_id, tag_id) VALUES (?, ?)");
	// 		const insertMany = db.transaction((tags) => {
	// 			for (const tag_id of tags) {
	// 				tagStmt.run(paper_id, tag_id);
	// 			}
	// 		});
	// 		insertMany(tags);
	// 	}
	// } catch (error) {
	// 	throw new Error(`Error adding tags: ${error.message}`);
	// }

	// Add all associated co-authors
	try {
		if (coauthors.length > 0) {
			const authorStmt = db.prepare("INSERT INTO author_papers (rauthor_id, rpaper_id) VALUES (?, ?)");
			const allAuthors = new Set([Number(publisher_id), ...coauthors]);

			coauthors.forEach((author) => {
				const author_details = readUserById(author);
				if (!author_details) {
					throw new Error(`Added co-author id(${author}) does not exist`);
				}
			});

			const insertAuthors = db.transaction((author_ids) => {
				for (const authorId of author_ids) {
					authorStmt.run(authorId, paper_id);
				}
			});
			insertAuthors(allAuthors);
		}
	} catch (error) {
		throw new Error(`Error adding co-authors: ${error.message}`);
	}

	try{
		const createdPaper = getPaperObjectById(paper_id);
		return createdPaper
	}catch(err){
		throw new Error("Could not find created paper")
	}
};

const updatePaper = (paper_id, fields = {}) => {
	const existingPaper = db.prepare("SELECT * FROM papers WHERE paper_id = ? AND deleted = 0").get(paper_id);
	if (!existingPaper) throw new Error(`Paper with id ${paper_id} does not exist or is deleted`);

	const allowedFields = ["category_id", "publisher_id", "paper_name", "file_url", "description", "meta"];
	const updateKeys = Object.keys(fields).filter((key) => allowedFields.includes(key) && fields[key] != null);

	if (updateKeys.length === 0 && !("tags" in fields) && !("coauthors" in fields)) {
		throw new Error("No valid fields provided for update");
	}

	db.transaction(() => {
		// include tags in updateKeys if we're using the JSON approach
		if ("tags" in fields && fields.tags != null) {
			const tagJson = JSON.stringify(fields.tags || []);
			updateKeys.push("tags");
			fields.tags = tagJson;
		}

		if (updateKeys.length > 0) {
			const setClause = updateKeys.map((field) => `${field} = ?`).join(", ");
			const values = updateKeys.map((field) => fields[field]);
			const stmt = db.prepare(`UPDATE papers SET ${setClause} WHERE paper_id = ?`);
			stmt.run(...values, paper_id);
		}

		// Previous normalized tag storage (now disabled)
		// if ("tags" in fields && fields.tags != null) {
		// 	db.prepare("DELETE FROM paper_tags WHERE paper_id = ?").run(paper_id);
		// 	const tagStmt = db.prepare("INSERT INTO paper_tags (paper_id, tag_id) VALUES (?, ?)");
		// 	for (const tag_id of fields.tags) {
		// 		tagStmt.run(paper_id, tag_id);
		// 	}
		// }

		if ("coauthors" in fields && fields.coauthors != null) {
			db.prepare("DELETE FROM author_papers WHERE rpaper_id = ?").run(paper_id);
			const authorStmt = db.prepare("INSERT INTO author_papers (rauthor_id, rpaper_id) VALUES (?, ?)");
			const authorSet = new Set([Number(fields.publisher_id ?? existingPaper.publisher_id), ...fields.coauthors.map(Number)]);

			fields.coauthors.forEach((authorId) => {
				if (!readUserById(authorId)) {
					throw new Error(`Author with id: ${authorId} does not exist`);
				}
			});

			for (const id of authorSet) {
				authorStmt.run(id, paper_id);
			}
		}
	})();

	try {
		const updatedPaper = getPaperObjectById(paper_id);
		return updatedPaper;
	} catch (err) {
		throw new Error(`updated paper could not be found`);
	}
};

const getPaperObjectById = (id) => {
	const stmt = db.prepare("SELECT * FROM papers WHERE paper_id = ? AND deleted = 0");
	return stmt.get(id);
};

const getPapers = (filters, offset = 0, limit = 30) => {
	let query = `
        SELECT DISTINCT papers.* 
        FROM papers 
        LEFT JOIN author_papers ON papers.paper_id = author_papers.rpaper_id
    `;
	const params = [];

	if (limit > 30) {
		throw new Error("Hard limit of 30 documents a time hit");
	}

	let conditions = ["1=1"]; // Ensures correct WHERE clause handling

	try {
		if (filters.id) {
			conditions.push("papers.paper_id = ?");
			params.push(Number(filters.id));
		}

		if (filters.category) {
			conditions.push("papers.category_id = ?");
			params.push(Number(filters.category));
		}

		// Previous normalized tag filter (commented out)
		// if (filters.tag) {
		// 	conditions.push("paper_tags.tag_id = ?");
		// 	params.push(Number(filters.tag));
		// }

		if (filters.tag) {
			conditions.push("papers.tags LIKE ?");
			params.push(`%${filters.tag}%`);
		}

		if (filters.publisher_id) {
			conditions.push("papers.publisher_id = ?");
			params.push(Number(filters.publisher_id));
		}

		if (filters.author_id) {
			conditions.push("author_papers.rauthor_id = ?");
			params.push(Number(filters.author_id));
		}

		if (filters.q) {
			conditions.push("(papers.paper_name LIKE ? OR papers.description LIKE ?)");
			params.push(`%${String(filters.q)}%`, `%${String(filters.q)}%`);
		}

		query += ` WHERE ${conditions.join(" AND papers.deleted = 0 AND ")}`;
		query += " ORDER BY papers.created_at DESC LIMIT ? OFFSET ?";
		params.push(limit, offset);

		const stmt = db.prepare(query);
		return stmt.all(...params);
	} catch (error) {
		console.error("Error filtering papers:", error);
		return null;
	}
};

const getPaperById = (paperId) => {
	try {
		const stmt = db.prepare("SELECT * FROM papers WHERE paper_id = ? AND deleted = 0");
		const paper = stmt.get(paperId);
		if (!paper) return null;

		// Fetch associated tags
		const tagStmt = db.prepare("SELECT tag_id FROM paper_tags WHERE paper_id = ?");
		const tags = tagStmt.all(paperId).map(tag => tag.tag_id);

		// Fetch co-authors
		const coauthorStmt = db.prepare("SELECT rauthor_id FROM author_papers WHERE rpaper_id = ?");
		const coauthors = coauthorStmt.all(paperId).map(author => author.rauthor_id);

		return {
			...paper,
			tags,
			coauthors
		};
	} catch (error) {
		console.error("Error fetching paper by ID:", error.message);
		return null;
	}
};

const getPapersByUserId = (userId) => {
    try {
        // Join the `papers` table with the `users` table to filter by publisher name
        const stmt = db.prepare(`
            SELECT papers.* 
            FROM papers
            JOIN users ON papers.publisher_id = users.id
            WHERE users.username = ? AND papers.deleted = 0
        `);
        const papers = stmt.all(publisherName);

        return papers;
    } catch (error) {
        console.error("Error fetching papers by publisher name:", error.message);
        throw error;
    }
};
const deletePaper = (paperId)=> {
	try{
		const stmt = db.prepare(
			`
			DELETE FROM papers
			WHERE paper_id = ?
			`
		);
		const result = stmt.run(paperId);

		// check if any row was deleted
		
		return result.changes > 0;
	} catch(error){
		console.error("Error deleting paper:",error.message);
		throw error;
	}
};


module.exports = {
	createPaper,
	updatePaper,
	getPapers,
	getPaperById,
	deletePaper,
	getPapersByUserId,
	getPaperObjectById,
};
