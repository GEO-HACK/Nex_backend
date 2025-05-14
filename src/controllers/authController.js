const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

// ✅ Asynchronous register function
const register = async (req, res) => {
	try {
		let { institution, username, fname, lname, email, password } = req.body;
		const role = "Author";

		if (!fname) return res.status(400).json({ error: "fname is required" });
		if (!lname) return res.status(400).json({ error: "lname is required" });
		if (!email) return res.status(400).json({ error: "email is required" });
		if (!password) return res.status(400).json({ error: "password is required" });
		if (!username || username == "") username = fname + " " + lname;

		// Check if the email is already registered
		const existingUser = await userModel.readUserByMail(email);
		if (existingUser) {
			return res.status(400).json({ message: "User email already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		userModel.createUser(institution, fname, lname, username, email, role, hashedPassword);
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Asynchronous registerAdmin function
const registerAdmin = async (req, res) => {
	try {
		let { institution, username, fname, lname, email, password } = req.body;
		const role = "Admin";

		if (!fname) return res.status(400).json({ error: "fname is required" });
		if (!lname) return res.status(400).json({ error: "lname is required" });
		if (!email) return res.status(400).json({ error: "email is required" });
		if (!password) return res.status(400).json({ error: "password is required" });
		if (!username || username == "") username = fname + " " + lname;

		// Check if the email already exists
		const existingUser = await userModel.readUserByMail(email);
		if (existingUser) {
			return res.status(400).json({ message: "User email already exists" });
		}

		console.log("Password: ", password);
		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		console.log("hashed password: ", hashedPassword);
		// Create user
		userModel.createUser(institution, fname, lname, username, email, role, hashedPassword);
		res.status(201).json({ message: "Admin registered successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Improved login function
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Fetch user from database
		const user = await userModel.readUserByMail(email);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

		res.status(200).json({
			token,
			user: {
				institution: user.institution_id,
				id: user.id,
				fname: user.fname,
				lname: user.lname,
				username: user.username,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Logout function (Handled client-side for JWT authentication)
const logout = (req, res) => {
	// JWT-based logout is handled on the client-side by removing the token
	res.status(200).json({ message: "Logout successful. Please remove token on client-side." });
};


module.exports = {
	register,
	login,
	logout,
	registerAdmin,
};
