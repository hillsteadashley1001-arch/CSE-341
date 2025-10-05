// ...existing code...
const express = require('express');
const db = require('./db/connect');

const app = express();
app.use(express.json());

// try to mount routes if they exist
try {
  const routes = require('./routes');
  app.use('/', routes);
} catch (err) {
  // no routes folder or index.js — continue without mounting routes
  console.log('No routes to mount:', err.message);
}

const PORT = process.env.PORT || 3000;

// Initialize DB (connect.initDb expects a callback and returns the MongoClient)
db.initDb((err, client) => {
  if (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
  console.log('Database initialized.');

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
// ...existing code...