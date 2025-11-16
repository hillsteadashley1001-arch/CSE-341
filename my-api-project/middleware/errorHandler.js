// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(status).json({
    error: {
      status,
      message
    }
  });
};

module.exports = errorHandler;