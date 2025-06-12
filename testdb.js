const mongoose = require('mongoose');
require('dotenv').config(); 

const categorySchema = new mongoose.Schema({
  category_id: Number,
  category_name: String,
});
const publisherSchema = new mongoose.Schema({
  publisher_id: Number,
  publisher_name: String,
});

// Define Paper schema and model
const paperSchema = new mongoose.Schema({
  paper_id: Number,
  paper_name: String,
  description: String,
  category_id: Number,   // Reference to Category by ID
  publisher_id: Number,  // Reference to Publisher by ID
  file_url: String,
  tags: [String],
  meta: mongoose.Schema.Types.Mixed,
  authors: [String],
  year: Number,
  deleted: { type: Boolean, default: false },
});

const Category = mongoose.model('Category', categorySchema);
const Publisher = mongoose.model('Publisher', publisherSchema);
const Paper = mongoose.model('Paper', paperSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to mongoDB');

    // Remove the incorrect index if it exists
    try {
      await Category.collection.dropIndex('category_1');
      console.log('Dropped index: category_1');
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log('Index category_1 does not exist, skipping drop.');
      } else {
        throw err;
      }
    }
    try {
      await Category.collection.dropIndex('name_1');
      console.log('Dropped index: name_1');
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log('Index name_1 does not exist, skipping drop.');
      } else {
        throw err;
      }
    }

    // Insert categories
    const categories = [
      { category_id: 6, category_name: 'Computer Science' },
      { category_id: 2, category_name: 'Physics' },
      { category_id: 3, category_name: 'Mathematics' },
      { category_id: 4, category_name: 'Biology' },
      { category_id: 5, category_name: 'Chemistry' },
    ];
    const catDocs = await Category.insertMany(categories);
    console.log('Categories inserted:', catDocs);

    // Insert publishers
    const publishers = [
      { publisher_id: 6, publisher_name: 'Springer' },
      { publisher_id: 2, publisher_name: 'Elsevier' },
      { publisher_id: 3, publisher_name: 'IEEE' },
      { publisher_id: 4, publisher_name: 'Wiley' },
      { publisher_id: 5, publisher_name: 'Taylor & Francis' },
    ];
    const pubDocs = await Publisher.insertMany(publishers);
    console.log('Publishers inserted:', pubDocs);

    // Delete all existing papers
    await Paper.deleteMany({});
    console.log('All existing papers deleted.');

    // Insert new papers
    const papers = [
      {
        paper_id: 1,
        paper_name: 'Deep Learning for Biology',
        description: 'A comprehensive overview of deep learning applications in biology.',
        category_id: 4, // Biology
        publisher_id: 6, // Springer
        file_url: 'https://example.com/deep-learning-biology.pdf',
        tags: ['deep learning', 'biology', 'AI'],
        meta: { pages: 15, language: 'en' },
        authors: ['Alice Smith', 'Bob Lee'],
        year: 2022,
        deleted: false,
      },
      {
        paper_id: 2,
        paper_name: 'Quantum Physics Advances',
        description: 'Latest advances in quantum physics research.',
        category_id: 2, // Physics
        publisher_id: 2, // Elsevier
        file_url: 'https://example.com/quantum-physics.pdf',
        tags: ['quantum', 'physics'],
        meta: { pages: 10, language: 'en' },
        authors: ['Carol White'],
        year: 2023,
        deleted: false,
      },
      {
        paper_id: 3,
        paper_name: 'Modern Algebra',
        description: 'An introduction to modern algebraic structures.',
        category_id: 3, // Mathematics
        publisher_id: 3, // IEEE
        file_url: 'https://example.com/modern-algebra.pdf',
        tags: ['algebra', 'mathematics'],
        meta: { pages: 20, language: 'en' },
        authors: ['David Black'],
        year: 2021,
        deleted: false,
      },
    ];
    const paperDocs = await Paper.insertMany(papers);
    console.log('Papers inserted:', paperDocs);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();








