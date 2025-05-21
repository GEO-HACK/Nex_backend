const { pool, poolConnect } = require('./src/config/dbConfig');

async function insertTestPapers() {
  await poolConnect;

  const request = pool.request();

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

  try {
    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i];

      await request
        .input(`category_id_${i}`, paper.category_id)
        .input(`publisher_id_${i}`, paper.publisher_id)
        .input(`paper_name_${i}`, paper.paper_name)
        .input(`file_url_${i}`, paper.file_url)
        .input(`description_${i}`, paper.description)
        .input(`meta_${i}`, JSON.stringify(paper.meta)) // Proper JSON string
        .input(`tags_${i}`, JSON.stringify(paper.tags)) // Proper JSON array string
        .query(
          `
          INSERT INTO papers 
            (category_id, publisher_id, paper_name, file_url, description, meta, tags)
          VALUES 
            (@category_id_${i}, @publisher_id_${i}, @paper_name_${i}, @file_url_${i}, @description_${i}, @meta_${i}, @tags_${i});
        `
        );
    }

    console.log("✅ Test papers inserted successfully.");
  } catch (err) {
    console.error("❌ Error inserting test papers:", err);
  }
}

insertTestPapers();
