const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testMongoConnection();