// routes/review.routes.js (CommonJS)
const express = require('express');
const { body, param, query } = require('express-validator');
const { authRequired, ownerRequired } = require('../middleware/auth.js');
const { validate } = require('../middleware/validate.js');
const reviewController = require('../controllers/review.controller.js');

const router = express.Router();

const objectId = (name) =>
  param(name).isMongoId().withMessage(`${name} must be a valid Mongo ObjectId`);

const createRules = [
  body('text').isString().trim().isLength({ min: 5 }).withMessage('text must be at least 5 chars'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating 1–5'),
];

const updateRules = [
  body('text').optional().isString().trim().isLength({ min: 5 }).withMessage('text min 5'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating 1–5'),
];

const listQueryRules = [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('sort').optional().isIn(['new', 'top']).withMessage('sort must be new|top'),
];

// Optional: sanity check types (uncomment if still failing)
// console.log('review.routes imports:', {
//   validate: typeof validate,
//   authRequired: typeof authRequired,
//   ownerRequired: typeof ownerRequired,
//   listFn: typeof reviewController?.listReviewsForBook,
//   createFn: typeof reviewController?.createReview,
//   updateFn: typeof reviewController?.updateReview,
//   deleteFn: typeof reviewController?.deleteReview,
// });

/**
 * GET /api/books/:bookId/reviews
 */
router.get(
  '/books/:bookId/reviews',
  validate([objectId('bookId'), ...listQueryRules]),
  reviewController.listReviewsForBook
);

/**
 * POST /api/books/:bookId/reviews
 */
router.post(
  '/books/:bookId/reviews',
  authRequired,
  validate([objectId('bookId'), ...createRules]),
  reviewController.createReview
);

/**
 * PUT /api/reviews/:id
 */
router.put(
  '/reviews/:id',
  authRequired,
  validate([objectId('id')]),
  ownerRequired('Review'),
  validate(updateRules),
  reviewController.updateReview
);

/**
 * DELETE /api/reviews/:id
 */
router.delete(
  '/reviews/:id',
  authRequired,
  validate([objectId('id')]),
  ownerRequired('Review'),
  reviewController.deleteReview
);

module.exports = router;