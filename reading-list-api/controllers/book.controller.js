// controllers/book.controller.js (CommonJS)
const mongoose = require('mongoose');
const Book = require('../models/Book.js');

// Avoid indefinite hangs on DB calls
const withTimeout = (p, ms = 5000) =>
  Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('DB timeout'), { status: 504 })), ms)
    ),
  ]);

// Normalize ISBN by removing hyphens/spaces
const normalizeIsbn = (v) => (typeof v === 'string' ? v.replace(/[-\s]/g, '') : v);

/**
 * GET /api/books
 * Query: q, genre, status, page=1, limit=20
 * Returns: { items, total, page, pages, limit }
 */
async function listBooks(req, res, next) {
  try {
    const { q, genre, status } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { author: regex }];
    }
    if (genre) filter.genre = genre;
    if (status) filter.status = status; // already validated in routes

    const findQ = Book.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
    const countQ = Book.countDocuments(filter).exec();

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
 * GET /api/books/:id
 */
async function getBookById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const doc = await withTimeout(Book.findById(id).lean().exec());
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    if (err?.message === 'DB timeout') {
      return res.status(504).json({ message: 'Request timed out while querying the database' });
    }
    next(err);
  }
}

/**
 * POST /api/books
 * Requires auth (req.user.id). Body validated in routes.
 */
async function createBook(req, res, next) {
  try {
    const owner = req.user?.id; // Mongo ObjectId string from JWT
    if (!owner) return res.status(401).json({ message: 'Unauthorized' });

    const doc = await withTimeout(
      Book.create({
        owner,
        title: req.body.title,
        author: req.body.author,
        isbn: normalizeIsbn(req.body.isbn),
        publishedYear: req.body.publishedYear,
        genre: req.body.genre,
        pages: req.body.pages,
        status: req.body.status,
        rating: req.body.rating ?? undefined,
      })
    );

    res.status(201).json(doc.toObject());
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const errors = Object.entries(err.errors || {}).map(([path, e]) => ({
        path,
        msg: e.message,
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err?.message === 'DB timeout') {
      return res.status(504).json({ message: 'Request timed out while writing to the database' });
    }
    next(err);
  }
}

/**
 * PUT /api/books/:id
 * Requires auth + ownership. Partial update.
 */
async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const doc = await withTimeout(Book.findById(id).exec());
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.owner?.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    const fields = ['title', 'author', 'isbn', 'publishedYear', 'genre', 'pages', 'status', 'rating'];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        doc[f] = f === 'isbn' ? String(req.body[f]).replace(/[-\s]/g, '') : req.body[f];
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
 * DELETE /api/books/:id
 * Requires auth + ownership.
 */
async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const doc = await withTimeout(Book.findById(id).exec());
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.owner?.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

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
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};