// routes/index.js (CommonJS) — unified router for Books, Reviews, Users
const express = require('express');
const { body, param, query } = require('express-validator');

const { authRequired, ownerRequired } = require('../middleware/auth.js');

// Controllers
const bookController = require('../controllers/book.controller.js');
const reviewController = require('../controllers/review.controller.js');
const userController = require('../controllers/user.controller.js');

// Simple validate helper
const { validationResult } = require('express-validator');
const validate = (rules = []) => [
  ...(Array.isArray(rules) ? rules : [rules]),
  (req, res, next) => {
    const r = validationResult(req);
    if (r.isEmpty()) return next();
    return res.status(400).json({ message: 'Validation failed', errors: r.array() });
  },
];

const router = express.Router();

// Common rules
const oid = (name = 'id') =>
  param(name).isMongoId().withMessage(`${name} must be a valid Mongo ObjectId`);

const listBooksQuery = [
  query('q').optional().isString().trim(),
  query('genre').optional().isString().trim(),
  query('status').optional().isIn(['to-read','reading','read']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const bookCreateRules = [
  body('title').isString().trim().notEmpty(),
  body('author').isString().trim().notEmpty(),
  body('isbn').isString().trim().custom((v) => {
    const s = v.replace(/[-\s]/g, '');
    if (!/^[0-9A-Za-z]+$/.test(s) || (s.length !== 10 && s.length !== 13)) {
      throw new Error('isbn must be alphanumeric and length 10 or 13 (hyphens allowed)');
    }
    return true;
  }),
  body('publishedYear').isInt({ min: 1450 }),
  body('genre').isString().trim().notEmpty(),
  body('pages').isInt({ min: 1 }),
  body('status').isIn(['to-read','reading','read']),
  body('rating').optional({ nullable: true }).isFloat({ min: 0, max: 5 }),
];

const bookUpdateRules = [
  body('title').optional().isString().trim().notEmpty(),
  body('author').optional().isString().trim().notEmpty(),
  body('isbn').optional().isString().trim().custom((v) => {
    const s = v.replace(/[-\s]/g, '');
    if (!/^[0-9A-Za-z]+$/.test(s) || (s.length !== 10 && s.length !== 13)) {
      throw new Error('isbn must be alphanumeric and length 10 or 13 (hyphens allowed)');
    }
    return true;
  }),
  body('publishedYear').optional().isInt({ min: 1450 }),
  body('genre').optional().isString().trim().notEmpty(),
  body('pages').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['to-read','reading','read']),
  body('rating').optional({ nullable: true }).isFloat({ min: 0, max: 5 }),
];

const listReviewsQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isIn(['new','top']),
];

const reviewCreateRules = [
  body('text').isString().trim().isLength({ min: 5 }),
  body('rating').isInt({ min: 1, max: 5 }),
];

const reviewUpdateRules = [
  body('text').optional().isString().trim().isLength({ min: 5 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
];

/* -------------------- Books -------------------- */
// GET /api/books
router.get('/books', validate(listBooksQuery), bookController.listBooks);

// GET /api/books/:id
router.get('/books/:id', validate(oid('id')), bookController.getBookById);

// POST /api/books (auth)
router.post('/books', authRequired, validate(bookCreateRules), bookController.createBook);

// PUT /api/books/:id (auth + owner)
router.put(
  '/books/:id',
  authRequired,
  validate(oid('id')),
  ownerRequired('Book'),
  validate(bookUpdateRules),
  bookController.updateBook
);

// DELETE /api/books/:id (auth + owner)
router.delete(
  '/books/:id',
  authRequired,
  validate(oid('id')),
  ownerRequired('Book'),
  bookController.deleteBook
);

/* -------------------- Reviews -------------------- */
// GET /api/books/:bookId/reviews
router.get(
  '/books/:bookId/reviews',
  validate([oid('bookId'), ...listReviewsQuery]),
  reviewController.listReviewsForBook
);

// POST /api/books/:bookId/reviews (auth)
router.post(
  '/books/:bookId/reviews',
  authRequired,
  validate([oid('bookId'), ...reviewCreateRules]),
  reviewController.createReview
);

// PUT /api/reviews/:id (auth + owner)
router.put(
  '/reviews/:id',
  authRequired,
  validate(oid('id')),
  ownerRequired('Review'),
  validate(reviewUpdateRules),
  reviewController.updateReview
);

// DELETE /api/reviews/:id (auth + owner)
router.delete(
  '/reviews/:id',
  authRequired,
  validate(oid('id')),
  ownerRequired('Review'),
  reviewController.deleteReview
);

/* -------------------- Users -------------------- */
// GET /api/users/me (auth)
router.get('/users/me', authRequired, userController.me);

// Optional: GET /api/users/:id
router.get('/users/:id', validate(oid('id')), userController.getById);

module.exports = router;