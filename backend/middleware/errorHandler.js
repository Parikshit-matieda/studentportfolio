// Global Error Handling Middleware with Mongoose Validation Support

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let errorMessage = err.message || 'Internal Server Error';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = `Invalid resource ID format: '${err.value}' is not a valid MongoDB ObjectId`;
  }

  // 2. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    errorMessage = `Schema Validation Error: ${messages.join(', ')}`;
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    errorMessage = 'Duplicate field value entered into database';
  }

  console.error(`[GLOBAL ERROR HANDLER] Status ${statusCode} - ${errorMessage}`);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;
