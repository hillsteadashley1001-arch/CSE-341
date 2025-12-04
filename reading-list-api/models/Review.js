// models/Review.js (CommonJS)
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Helpful indexes
reviewSchema.index({ book: 1, createdAt: -1 });
// Optional: one review per reviewer per book (uncomment if desired)
// reviewSchema.index({ book: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);