const express = require('express');
const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.send('API is up');
});

// Feature routes
router.use('/contacts', require('./contacts'));

module.exports = router;