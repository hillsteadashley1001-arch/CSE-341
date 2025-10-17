require('dotenv').config();
const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Make sure this file exists

const mongodb = require('./db/connect'); // Uses your existing initDb pattern

const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => res.send({ ok: true }));

// API routes
// If you keep routes/index.js that mounts /contacts, you can do app.use('/', require('./routes'))
// But for clarity with the rubric, mount the contacts router explicitly:
app.use('/contacts', require('./routes/contacts'));

// Swagger GUI at /api-docs (required by rubric)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize DB and start server
mongodb.initDb((err) => {
  if (err) {
    console.error('DB init error:', err);
    process.exit(1);
  } else {
    app.listen(port, () => console.log(`Connected to DB and listening on ${port}`));
  }
});