const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/connect');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/', routes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An error occurred', error: err.message });
});

// Register route files
app.use('/contacts', require('./routes/index'));
// ... other route registrations ...

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: { status: 404, message: 'Not Found - The requested resource does not exist' } });
});

// Global error handler - must be last middleware
app.use(errorHandler);

// Initialize database and start server
initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});