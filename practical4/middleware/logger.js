// Request Logging Middleware
// Logs method, URL, and timestamp for every incoming HTTP request

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

export default requestLogger;
