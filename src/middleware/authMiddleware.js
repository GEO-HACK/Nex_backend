const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
	const authHeader = req.header("Authorization");
	if (!authHeader) return res.status(401).json({ message: "Access denied, no authorization token provided." });

	token = authHeader.split(" ")[1]; // remove the bearer bit
	if (!token) {
		return res.status(401).json({ message: "Access denied, invalid token format." });
	}

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		console.log("Verified: ", req.user);
		next();
	} catch (err) {
		res.status(403).json({ message: "Invalid token" });
	}
};

const checkRole = (roles) => {
	return (req, res, next) => {
		const userRole = req.user.role.toLowerCase();

		if (!req.user || !roles.includes(userRole)) {
			return res.status(403).json({ message: "Forbidden: You do not have access" });
		}

		if (userRole === "author" || userRole === "admin") {
			next();
		} else {
			console.warn(`unregistered role detected: ${userRole}`);
			res.status(403).json({ message: "forbidden: you do not have access" });
		}
	};
};

module.exports = {
	verifyToken,
	checkRole,
};
