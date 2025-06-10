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

const Category = mongoose.model('Category', categorySchema);
const Publisher = mongoose.model('Publisher', publisherSchema);

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

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();








