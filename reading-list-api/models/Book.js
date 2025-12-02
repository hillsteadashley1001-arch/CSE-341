const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  publishedYear: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    required: false
  },
  pages: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['to-read', 'reading', 'read'],
    default: 'to-read'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);