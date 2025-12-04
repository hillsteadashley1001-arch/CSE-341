// controllers/review.controller.js (CommonJS)
const mongoose = require('mongoose');
const Review = require('../models/Review.js');
const Book = require('../models/Book.js');

// Avoid indefinite hangs on DB calls
const withTimeout = (p, ms = 5000) =>
  Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('DB timeout'), { status: 504 })), ms)
    ),
  ]);

/**
 * GET /api/books/:bookId/reviews
 * Query: page=1, limit=20, sort=new|top (default new)
 * Returns: { items, total, page, pages, limit }
 */
async function listReviewsForBook(req, res, next) {
  try {
    const { bookId } = req.params;
    if (!mongoose.isValidObjectId(bookId)) return res.status(400).json({ message: 'Invalid id' });

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const sortKey = req.query.sort === 'top' ? { rating: -1, createdAt: -1 } : { createdAt: -1 };

    // ensure book exists (optional but nice)
    const bookExists = await withTimeout(Book.exists({ _id: bookId }));
    if (!bookExists) return res.status(404).json({ message: 'Not found' });

    const findQ = Review.find({ book: bookId })
      .sort(sortKey)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
    const countQ = Review.countDocuments({ book: bookId }).exec();

    const [items, total] = await withTimeout(Promise.all([findQ, countQ]), 5000);

    res.json({
      items,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      limit,
    });
  } catch (err) {
    if (err?.message === 'DB timeout') {
      return res.status(504).json({ message: 'Request timed out while querying the database' });
    }
    next(err);
  }
}

/**
 * POST /api/books/:bookId/reviews
 * Requires auth. Body validated in routes: { text, rating }
 */
async function createReview(req, res, next) {
  try {
    const reviewer = req.user?.id; // ObjectId string from JWT
    if (!reviewer) return res.status(401).json({ message: 'Unauthorized' });

    const { bookId } = req.params;
    if (!mongoose.isValidObjectId(bookId)) return res.status(400).json({ message: 'Invalid id' });

    // ensure book exists
    const book = await withTimeout(Book.findById(bookId).select('_id').lean().exec());
    if (!book) return res.status(404).json({ message: 'Not found' });

    const doc = await withTimeout(
      Review.create({
        book: bookId,
        reviewer,
        text: req.body.text,
        rating: req.body.rating,
      })
    );

    res.status(201).json(doc.toObject());
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const errors = Object.entries(err.errors || {}).map(([path, e]) => ({ path, msg: e.message }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err?.code === 11000) {
      // if you enable unique index (book + reviewer)
      return res.status(409).json({ message: 'You already reviewed this book' });
    }
    if (err?.message === 'DB timeout') {
      return res.status(504).json({ message: 'Request timed out while writing to the database' });
    }
    next(err);
  }
}

/**
 * PUT /api/reviews/:id
 * Requires auth + ownership. Partial update: { text?, rating? }
 */
async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const doc = await withTimeout(Review.findById(id).exec());
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.reviewer?.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    const fields = ['text', 'rating'];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        doc[f] = req.body[f];
      }
    }

    await withTimeout(doc.save());
    res.json(doc.toObject());
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed' });
    }
    if (err?.message === 'DB timeout') {
      return res.status(504).json({ message: 'Request timed out while updating the database' });
    }
    next(err);
  }
}

/**
 * DELETE /api/reviews/:id
 * Requires auth + ownership.
 */
async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const doc = await withTimeout(Review.findById(id).exec());
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.reviewer?.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    await withTimeout(doc.deleteOne());
    res.status(204).send();
  } catch (err) {
    if (err?.message === 'DB timeout') {
      return res.status(504).json({ message: 'Request timed out while deleting from the database' });
    }
    next(err);
  }
}

module.exports = {
  listReviewsForBook,
  createReview,
  updateReview,
  deleteReview,
};