const mongoose = require('mongoose');
require('dotenv').config(); 

const paperSchema = new mongoose.Schema({
  category_id: Number,
  publisher_id: Number,
  paper_name: String,
  file_url: String,
  description: String,
  meta: {
    pages: Number,
    published: Number,
  },
  tags: [String],
});

const Paper = mongoose.model('Paper', paperSchema);

async function fetchAllPapers() {
  try {
    await mongoose.connect(process.env.MONGO_URI,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); // Or hardcode your URI

    const papers = await Paper.find({});
    console.log("📄 All Papers:", papers);
    process.exit();
  } catch (err) {
    console.error("❌ Error fetching papers:", err);
    process.exit(1);
  }
}

fetchAllPapers();
