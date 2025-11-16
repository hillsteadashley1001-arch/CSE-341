const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const { body, validationResult } = require('express-validator');
const createError = require('http-errors');
const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;

// GET all items
router.get('/items', controller.getAllItems);

// GET a single item by ID
router.get('/items/:id', controller.getItemById);

// POST a new item
router.post('/items', controller.createItem);

// PUT route to update a contact by ID
router.put('/:id', 
  // Validation middleware
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('favoriteColor').notEmpty().withMessage('Favorite color is required'),
    body('birthday').notEmpty().withMessage('Birthday is required')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify ID format
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return next(createError(400, 'Invalid contact ID format'));
      }

      const contact = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        favoriteColor: req.body.favoriteColor,
        birthday: req.body.birthday
      };

      const response = await mongodb
        .getDb()
        .db()
        .collection('contacts')
        .replaceOne({ _id: new ObjectId(id) }, contact);

      if (response.modifiedCount > 0) {
        res.status(204).send(); // No content response on success
      } else {
        next(createError(404, 'Contact not found or no changes made'));
      }
    } catch (err) {
      next(err);
    }
  }
);

// DELETE route to remove a contact by ID
router.delete('/:id', async (req, res, next) => {
  try {
    // Verify ID format
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const response = await mongodb
      .getDb()
      .db()
      .collection('contacts')
      .deleteOne({ _id: new ObjectId(id) });

    if (response.deletedCount > 0) {
      res.status(204).send(); // No content response on success
    } else {
      next(createError(404, 'Contact not found'));
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;