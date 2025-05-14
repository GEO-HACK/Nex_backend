const fs = require("fs");
const path = require("path");

const ensurePathExists = (location) => {
	return (req, res, next) => {
		const uploadPath = path.join(__dirname, location);

		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}

		next();
	};
};

module.exports = { ensurePathExists };
