const mongoose = require('mongoose');
const Paper = require('./src/models/schema'); // Adjust the path
require('dotenv').config();

const papers = [
  {
    category_id: 4,
    publisher_id: 1,
    paper_name: "Deep Learning in 2025",
    file_url: "https://example.com/papers/deep-learning-2025.pdf",
    description: "An overview of deep learning techniques and their future prospects.",
    meta: { pages: 45, published: 2025 },
    tags: ["AI", "ML"],
  },
  {
    category_id: 3,
    publisher_id: 1,
    paper_name: "Modern Web Technologies",
    file_url: "https://example.com/papers/web-tech.pdf",
    description: "Exploring the evolution of frontend frameworks.",
    meta: { pages: 30, published: 2024 },
    tags: ["Web", "JavaScript"],
  },
  {
    category_id: 2,
    publisher_id: 1,
    paper_name: "Cybersecurity Essentials",
    file_url: "https://example.com/papers/cybersecurity.pdf",
    description: "Key concepts in securing modern digital systems.",
    meta: { pages: 28, published: 2023 },
    tags: ["Security", "Networks"],
  },
  {
    category_id: 1,
    publisher_id: 1,
    paper_name: "Data Science Trends",
    file_url: "https://example.com/papers/data-science.pdf",
    description: "Current and upcoming trends in data science.",
    meta: { pages: 35, published: 2024 },
    tags: ["Data", "ML"],
  },
  {
    category_id: 8,
    publisher_id: 1,
    paper_name: "Natural Language Processing Explained",
    file_url: "https://example.com/papers/nlp.pdf",
    description: "Understanding how machines process language.",
    meta: { pages: 50, published: 2025 },
    tags: ["AI", "NLP"],
  },
];

async function insertTestPapers() {
  try {
    await mongoose.connect(process.env.MONGO_URI,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Paper.insertMany(papers);

    console.log(" Papers inserted into MongoDB successfully.");
    process.exit();
  } catch (error) {
    console.error(" Error inserting papers:", error);
    process.exit(1);
  }
}

insertTestPapers();
