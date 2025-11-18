// middleware/errorHandler.js
/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  // Log full error for server diagnostics
  // Prefer stack when available
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Server error';

  // Helpful server-side logging
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error(`[Error] ${status}: ${message}`, err);
  }

  // Normalize common MongoDB errors
  // Duplicate key
  if (err && (err.code === 11000 || err.code === 11001)) {
    return res.status(409).json({
      message: 'Duplicate key',
      errors: [{ msg: 'A document with that unique value already exists.' }]
    });
  }

  // Invalid ObjectId (varies by driver/version)
  if (err?.name === 'BSONTypeError' || err?.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      errors: [{ msg: 'Provide a valid 24-character hex ObjectId.' }]
    });
  }

  // If express-validator passed details via err.errors, include them
  const payload = {
    message,
    errors: err.errors || undefined
  };

  // Optionally include a minimal request trace for debugging (comment out if not desired)
  // payload.trace = { method: req.method, path: req.originalUrl };

  return res.status(status).json(payload);
};

module.exports = errorHandler;