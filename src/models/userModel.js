// userModel_mongo.js
const mongoose = require("mongoose");

// Institution schema and model
const institutionSchema = new mongoose.Schema({
  institution_name: { type: String, required: true, unique: true },
});

const Institution = mongoose.model("Institution", institutionSchema);

// User schema and model
const userSchema = new mongoose.Schema({
  institution_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Helper: Find or create institution, return institution's ObjectId
async function joinInstitution(institutionName) {
  try {
    let institution = await Institution.findOne({ institution_name: institutionName });
    if (!institution) {
      institution = new Institution({ institution_name: institutionName });
      await institution.save();
    }
    return institution._id;
  } catch (error) {
    throw new Error(`Error fetching institution id: ${error.message}`);
  }
}

// Create user with institution handling
async function createUser(institutionName, fname, lname, username, email, role, password) {
  try {
    const institutionId = await joinInstitution(institutionName);

    const newUser = new User({
      institution_id: institutionId,
      fname,
      lname,
      username,
      email,
      role,
      password, // Consider hashing password before saving in production!
    });

    await newUser.save();
    return newUser._id;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
}

// Read user by email
async function readUserByMail(email) {
  try {
    return await User.findOne({ email }).lean();
  } catch (error) {
    console.error("Error reading user by email", error);
    return null;
  }
}

// Read user by id (with limited fields)
async function readUserById(id) {
  try {
    return await User.findById(id, "fname lname email role").lean();
  } catch (error) {
    console.error("Error reading user by id", error);
    return null;
  }
}

// Get authors by query (search fname, lname, username), limit default 10
async function getAuthors(query, limit = 10) {
  try {
    const regex = new RegExp(query, "i");
    const authors = await User.find(
      {
        role: "Author",
        $or: [{ fname: regex }, { lname: regex }, { username: regex }],
      },
      "id fname lname username institution_id"
    )
      .limit(limit)
      .sort({ fname: 1 })
      .lean();

    console.log("Fetched authors: ", authors);
    return authors;
  } catch (error) {
    console.error("Error fetching authors", error);
    return [];
  }
}

module.exports = {
  createUser,
  readUserByMail,
  readUserById,
  getAuthors,
  joinInstitution,
};
