const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const port = 5000;
const database = require("./src/config/dbSetupConfig");

dotenv.config(); //process.env available

app.use(express.json());
//app.use(express.urlencoded({extended: true}))
app.use(cors());

//Routes import
const authRoutes = require("./src/routes/authRoutes");
const paperRoutes = require("./src/routes/paperRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const tagRoutes = require("./src/routes/tagRoutes");
const userRoutes = require("./src/routes/userRoutes");
const devRoutes = require("./src/routes/devRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/dev", devRoutes);

// setup db
database.setupDb();

app.get("/api", (req, res) => {
	const message = req.query.message;

	res.json({
		"Server response": "Server reached successfully",
		"client message": message || "No message received from client",
	});
});

const path = require("path");

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.listen(port, () => {
	console.log("Node server running on port", port);
});
