const userModel = require("../models/userModel");

const getUser = async (req, res) => {
	try {
		const user = await userModel.readUserById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "User does not exist" });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

const filterAuthors = async (req, res) => {
	try {
		let name = req.query.name?.trim() || ""
        let limit = parseInt(req.query.limit)

		if (limit > 15) {
			limit = 15;
			console.warn("15 users max limit hit");
		}
        if (isNaN(limit) || limit <= 0 ) limit = 10

        console.log("Name queried: ", name)
        console.log("Limit given: ", limit)
        const authors = userModel.getAuthors(name, limit)
        if (!authors || authors.length <= 0){
            return res.status(404).json({message: "not found"})
        }

        res.status(200).json(authors)
	} catch (error) {
        console.error("Error filtering authors", error)
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = {
    getUser,
    filterAuthors
}
