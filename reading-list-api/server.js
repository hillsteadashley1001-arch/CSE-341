// server.js (CommonJS)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const { swaggerSpec } = require('./docs/swagger.js');

// Initialize Passport strategy (Google OAuth)
const passport = require('./auth/passport.js');

// Routers
const authRoutes = require('./routes/auth.routes.js');
const bookRoutes = require('./routes/book.routes.js');
const reviewRoutes = require('./routes/review.routes.js');

// Error handlers
const { notFound, errorHandler } = require('./middleware/error.js');

const app = express();

// Trust proxy in production (needed for Secure cookies on Render/Heroku/etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS (allow credentials for cookie auth)
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('[CORS] CORS_ORIGIN not set in production, defaulting to', origin);
}
app.use(
  cors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsers
app.use(express.json());
app.use(cookieParser());

// Simple request logger (after CORS/parsers for cleaner logs)
app.use((req, _res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

// Passport (stateless; no express-session)
app.use(passport.initialize());

// Health
app.get('/health', (_req, res) => res.sendStatus(200));

// Optional landing → docs
app.get('/', (_req, res) => res.redirect('/docs'));

// Swagger UI (send cookies)
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true,
      requestInterceptor: (req) => {
        req.credentials = 'include';
        return req;
      },
    },
  })
);

// Diagnostics (temporary; remove if desired)
app.get('/db-status', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'];
  res.json({
    readyState: mongoose.connection.readyState,
    state: states[mongoose.connection.readyState] || 'unknown',
  });
});
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', reviewRoutes); // /api/books/:bookId/reviews and /api/reviews/:id

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

// Startup
const port = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

(async () => {
  try {
    // mongoose.set('debug', true); // uncomment to see queries
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log('MongoDB connected');
    const server = app.listen(port, () => {
      console.log(`API on http://localhost:${port}`);
    });

    // Graceful shutdown
    const close = () =>
      server.close(() =>
        mongoose.connection.close(false, () => {
          console.log('Shutdown complete');
          process.exit(0);
        })
      );
    process.on('SIGINT', close);
    process.on('SIGTERM', close);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
})();