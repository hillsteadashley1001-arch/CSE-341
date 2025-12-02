const express = require('express');
const router = express.Router();
const booksController = require('../controllers/book.controller');

// List
router.get('/', /* #swagger.tags = ['Books'] */ booksController.getAllBooks);

// Create
router.post('/',
  /* #swagger.tags = ['Books'] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Book to create',
        schema: { $ref: '#/definitions/BookCreate' }
  } */
  booksController.createBook
);

// Detail
router.get('/:id', /* #swagger.tags = ['Books'] */ booksController.getBookById);

// Update
router.put('/:id',
  /* #swagger.tags = ['Books'] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/BookCreate' }
  } */
  booksController.updateBook
);

// Delete
router.delete('/:id', /* #swagger.tags = ['Books'] */ booksController.deleteBook);

module.exports = router;