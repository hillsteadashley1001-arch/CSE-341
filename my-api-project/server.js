// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/connect');
const routes = require('./routes'); // routes/index.js exports a Router
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

/* 1) Core middleware */
app.use(cors());
app.use(express.json());

/* 2) Request logger (helps debug 404s and bodies) */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
  }
  next();
});

/* 3) API routes (mounted at root: /items, /items/:id, etc.) */
app.use('/', routes);

/* 4) Swagger */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* 5) 404 for unmatched routes */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* 6) Centralized error handler (must be last) */
app.use(errorHandler);

/* 7) Init DB then listen */
initDb((err) => {
  if (err) {
    console.error('DB init error:', err);
    return; // keep process alive to inspect logs
  }
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
});