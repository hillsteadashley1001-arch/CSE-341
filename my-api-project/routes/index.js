// routes/index.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const controller = require('../controllers');

// Helper to surface validation errors (logs + response)
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(e => ({
      field: e.path,
      value: e.value,
      msg: e.msg,
      location: e.location
    }));
    console.log('Validation errors:', JSON.stringify(details, null, 2));
    const err = new Error('Validation failed');
    err.status = 400;
    err.errors = details;
    return next(err);
  }
  next();
};

// POST: require name; price optional but must be number > 0 if provided
const validateItemCreate = [
  body('name')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('name is required'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('price must be a number > 0'),
  handleValidation
];

// PUT: allow partial updates; if present, fields must be valid
// Also block entirely empty body before reaching the controller
const blockEmptyBodyOnUpdate = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    const err = new Error('No fields to update');
    err.status = 400;
    return next(err);
  }
  next();
};

const validateItemUpdate = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('price must be a number > 0'),
  handleValidation
];

// Items routes
router.get('/items', controller.getAllItems);
router.get('/items/:id', controller.getItemById);
router.post('/items', validateItemCreate, controller.createItem);
router.put('/items/:id', blockEmptyBodyOnUpdate, validateItemUpdate, controller.updateItem);
router.delete('/items/:id', controller.deleteItem);

module.exports = router;