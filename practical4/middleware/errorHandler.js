// Global Error Handling Middleware
// Positioned at the very end of the middleware pipeline to capture unhandled errors

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  console.error(`[GLOBAL ERROR HANDLER] ${err.message || 'Internal Server Error'}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;
