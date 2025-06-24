require('dotenv').config();
const mongoose = require('mongoose');

// Full User Schema based on your DB structure
const userSchema = new mongoose.Schema({
  institution_id: mongoose.Schema.Types.ObjectId,
  fname: String,
  lname: String,
  username: String,
  email: String,
  role: String,
  password: String,
  isActive: Boolean,
  isVerified: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    const users = await User.find(); // Fetch all users

    if (users.length === 0) {
      console.log("No users found.");
    } else {
      console.log(`📄 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID           : ${user._id}`);
        console.log(`  InstitutionID: ${user.institution_id}`);
        console.log(`  Name         : ${user.fname} ${user.lname}`);
        console.log(`  Username     : ${user.username}`);
        console.log(`  Email        : ${user.email}`);
        console.log(`  Role         : ${user.role}`);
        console.log(`  Is Active    : ${user.isActive}`);
        console.log(`  Is Verified  : ${user.isVerified}`);
        console.log(`  Created At   : ${user.createdAt}`);
        console.log('---------------------------------------');
      });
    }

  } catch (err) {
    console.error("❌ Failed to fetch users:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

main();
