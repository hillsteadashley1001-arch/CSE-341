// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // for ownership checks
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true }, // stored compact (no hyphens/spaces)
    publishedYear: { type: Number, required: true, min: 1450 },
    genre: { type: String, required: true },
    pages: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['to-read', 'reading', 'read'], required: true, default: 'to-read' },
    rating: { type: Number, min: 0, max: 5 }, // optional
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Optional: simple index to speed up list queries with q filter
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);