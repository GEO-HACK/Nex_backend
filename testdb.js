const mongoose = require("mongoose");

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

// Sample categories
const categories = [
  { category: "Data Science" },
  { category: "Artificial Intelligence" },
  { category: "Cybersecurity" },
  { category: "Web Development" },
  { category: "Cloud Computing" },
  { category: "DevOps" },
  { category: "Networking" },
  { category: "Natural Language Processing" },
];

async function insertTestCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb");

    // Optional: Clear old data
    // await Category.deleteMany({});

    const result = await Category.insertMany(categories, { ordered: false });
    console.log("✅ Categories inserted successfully:", result);
    process.exit();
  } catch (error) {
    if (error.code === 11000) {
      console.error("⚠️ Some categories already exist. Skipping duplicates.");
    } else {
      console.error("❌ Error inserting categories:", error);
    }
    process.exit(1);
  }
}

insertTestCategories();
