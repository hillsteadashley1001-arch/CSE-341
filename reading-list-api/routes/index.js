const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// GET all items
router.get('/items', controller.getAllItems);

// GET a single item by ID
router.get('/items/:id', controller.getItemById);

// POST a new item
router.post('/items', controller.createItem);

// Define these routes for Swagger documentation, but we'll implement them later
// PUT update an item
router.put('/items/:id', (req, res) => {
  // This is a placeholder for Swagger documentation
  res.status(501).json({ message: 'Not implemented yet' });
});

// DELETE an item
router.delete('/items/:id', (req, res) => {
  // This is a placeholder for Swagger documentation
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;