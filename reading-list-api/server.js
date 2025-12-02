const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mongo
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

// Default route
app.get('/', (req, res) => { res.json({ message: 'Welcome to the Reading List API' }); });

// Swagger first (before any catch-all routes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Books under prefix (recommended)
const booksRoutes = require('./routes/book.routes');
app.use('/api/books', booksRoutes);

// Start
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });