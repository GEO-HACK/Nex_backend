const tagModel = require("../models/tagModel");

const getTags = (req, res) => {
	try {
		const field = req.query.field;
		const id = req.query.id;
		const q = req.query.q;

		const tags = tagModel.getTags(field, id, q);
		return res.status(200).json({ data: tags });
	} catch (error) {
		console.error("Error fetching tags", error);
		return res.status(500).json({ error: "operation failed" });
	}
};

const addTags = (req, res) => {
	//? Accepts multiple tags in a related field
	const { tags } = req.body;
	let successfullyAddedTags = [];

	
	if (!tags) {
		return res.status(400).json({ error: "the key 'tags' is required in the body" });
	}
	if (!Array.isArray(tags)) {
		return res.status(400).json({ error: "the key 'tags' only accepts arrays as value" });
	}
	if (tags.length === 0) {
		return res.status(400).json({ error: "the key 'tags' cannot be an empty array" });
	}

	try {
		for (const tag of tags) {
			tagModel.createTag(tag);
			successfullyAddedTags.push({ tag, field });
		}

		return res.status(200).json({ message: "Tags successfully added", addedTags: successfullyAddedTags });
	} catch (error) {
		console.error("Error adding tags: ", error);
		return res.status(500).json({ error: `Operation failed. Only the following tags could be added: ${JSON.stringify(successfullyAddedTags)}` });
	}
};

const addTag = (req, res) => {
	const { field, tag } = req.body;
	if (!field || field.length === 0) {
		return res.status(400).json({ error: "the key 'field' is either empty or not included" });
	}
	if (!tag) {
		return res.status(400).json({ error: "the key 'tag' is required in the body" });
	}
	if (Array.isArray(tag)) {
		return res.status(400).json({ error: "the key only one tag can be added using /single endpoint" });
	}
	if (tag.length === 0) {
		return res.status(400).json({ error: "the key 'tags' cannot be  empty" });
	}

	try {
		tagModel.createTag(field, tag);
		return res.status(200).json({ message: "Tags successfully added", addedTags: successfullyAddedTags });
	} catch (error) {
		console.error("Error adding tag: ", error);
		return res.status(500).json({ error: "Operation failed." });
	}
};

module.exports = {
	getTags,
	addTags,
	addTag,
};
