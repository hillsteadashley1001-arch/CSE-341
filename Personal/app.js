// Load env first
require('dotenv').config();

const express = require('express');
const mongodb = require('./db/connect');

const port = process.env.PORT || 8080;
const app = express();

app
  .use(express.json())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  })
  // Optional: health/root endpoint
  .get('/', (req, res) => res.send('API is up'))
  // Mount feature routes
  .use('/', require('./routes'));

mongodb.initDb((err) => {
  if (err) {
    console.error('DB init error:', err);
  } else {
    app.listen(port, () => {
      console.log(`Connected to DB and listening on ${port}`);
    });
  }
});