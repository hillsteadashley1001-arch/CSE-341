// routes/book.routes.js (CommonJS)
const express = require('express');
const { body, param, query } = require('express-validator');
const { authRequired, ownerRequired } = require('../middleware/auth.js');
const { validate } = require('../middleware/validate.js');
const bookController = require('../controllers/book.controller.js');

const router = express.Router();
const currentYear = new Date().getFullYear();

const objectIdRule = (name = 'id') =>
  param(name).isMongoId().withMessage(`${name} must be a valid Mongo ObjectId`);

const createRules = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('author').isString().trim().notEmpty().withMessage('author is required'),
  body('isbn')
    .isString()
    .trim()
    .custom((v) => {
      const s = v.replace(/[-\s]/g, '');
      if (!/^[0-9A-Za-z]+$/.test(s) || (s.length !== 10 && s.length !== 13)) {
        throw new Error('isbn must be alphanumeric and length 10 or 13 (hyphens allowed)');
      }
      return true;
    }),
  body('publishedYear').isInt({ min: 1450, max: currentYear }),
  body('genre').isString().trim().notEmpty(),
  body('pages').isInt({ min: 1 }),
  body('status').isIn(['to-read', 'reading', 'read']),
  body('rating').optional({ nullable: true }).isFloat({ min: 0, max: 5 }),
];

const updateRules = [
  body('title').optional().isString().trim().notEmpty(),
  body('author').optional().isString().trim().notEmpty(),
  body('isbn')
    .optional()
    .isString()
    .trim()
    .custom((v) => {
      const s = v.replace(/[-\s]/g, '');
      if (!/^[0-9A-Za-z]+$/.test(s) || (s.length !== 10 && s.length !== 13)) {
        throw new Error('isbn must be alphanumeric and length 10 or 13 (hyphens allowed)');
      }
      return true;
    }),
  body('publishedYear').optional().isInt({ min: 1450, max: currentYear }),
  body('genre').optional().isString().trim().notEmpty(),
  body('pages').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['to-read', 'reading', 'read']),
  body('rating').optional({ nullable: true }).isFloat({ min: 0, max: 5 }),
];

const listQueryRules = [
  query('q').optional().isString().trim(),
  query('genre').optional().isString().trim(),
  query('status').optional().isIn(['to-read', 'reading', 'read']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
];

router.get('/', validate(listQueryRules), bookController.listBooks);
router.get('/:id', validate([objectIdRule()]), bookController.getBookById);

router.post('/', authRequired, validate(createRules), bookController.createBook);

router.put(
  '/:id',
  authRequired,
  validate([objectIdRule()]),
  ownerRequired('Book'),
  validate(updateRules),
  bookController.updateBook
);

router.delete(
  '/:id',
  authRequired,
  validate([objectIdRule()]),
  ownerRequired('Book'),
  bookController.deleteBook
);

// Optional: keep a debug log AFTER imports to confirm types
console.log('book.routes imports:', {
  validateType: typeof validate,
  authRequiredType: typeof authRequired,
  ownerRequiredType: typeof ownerRequired,
  updateBookType: typeof bookController?.updateBook,
});

module.exports = router;