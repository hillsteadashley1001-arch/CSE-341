// middleware/error.js (CommonJS)
function notFound(req, res) {
  res.status(404).json({
    message: 'Not Found',
    path: req.originalUrl,
    method: req.method,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const traceId = req.id || req.headers['x-request-id'] || undefined;
  const isProd = process.env.NODE_ENV === 'production';

  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 400;
    message = 'Invalid identifier';
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
  }
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }
  if (status === 401 && !message) message = 'Unauthorized';
  if (status === 403 && !message) message = 'Forbidden';

  const payload = {
    message: isProd && status === 500 ? 'Internal Server Error' : message,
  };
  if (Array.isArray(err.errors)) payload.errors = err.errors;
  if (traceId) payload.traceId = String(traceId);

  // eslint-disable-next-line no-console
  console.error(`[error] ${req.method} ${req.originalUrl}`, {
    status,
    traceId,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };