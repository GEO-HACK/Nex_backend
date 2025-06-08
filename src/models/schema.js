const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  category_id: {
    type: Number,
    required: true,
  },
  publisher_id: {
    type: Number,
    required: true,
  },
  paper_name: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  meta: {
    type: Object,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Paper = mongoose.model('Paper', paperSchema);

module.exports = Paper;
