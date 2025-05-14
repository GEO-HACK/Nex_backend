const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./b2Config");
const path = require("path");
const destinationDirectory = "../uploads";

// const validateFields = (req, res, cb) => {
// 	const { name, category, description } = req.body;

// 	if (!name || !category || !description) {
// 		console.log(req.body)
// 		return cb(new Error("one/multiple required felds are missing in the request body"));
// 	}

// 	cb(null, true);
// };

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.B2_BUCKET_NAME,
		acl: "public-read",
		key: function (req, file, cb) {
			const filename = `research-papers/${Date.now()}-${file.originalname}`;
			cb(null, filename);
		},
	}),
	// fileFilter: validateFields,
});

const localstore = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, path.join(__dirname, destinationDirectory));
		},
		filename: function (req, file, cb) {
			const filename = Date.now() + "-" + file.originalname;
			console.log("Uploaded file: ", filename);
			req.fileUrl = `${destinationDirectory}/${filename}`;
			cb(null, filename); // Unique filename
		},
	}),
	// fileFilter: validateFields,
});

module.exports = {
	upload,
	localstore,
};
